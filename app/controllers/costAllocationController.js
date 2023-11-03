"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const moment_1 = __importDefault(require("moment"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const customError_1 = require("../models/customError");
const companyRepository_1 = __importDefault(require("../repositories/companyRepository"));
const costallocationServices_1 = __importDefault(require("../services/costallocationServices"));
const costAllocationPdf_1 = require("../templates/costAllocationPdf");
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const prisma_1 = require("../client/prisma");
class CostAllocationController {
    getCostAllocation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { companyId, page = 1, limit = 10, search = '', createdBy = '', type = '', sort = '', classId = '', customerId = '', employeeId = '', payPeriodId = null, } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(404, 'Company id is required');
                }
                const companyDetails = yield companyRepository_1.default.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Cost Allocations',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                let _payPeriodId = payPeriodId;
                const _date = new Date();
                let systemPayPeriodId = false;
                if (!_payPeriodId) {
                    const payPeriodData = yield prisma_1.prisma.payPeriod.findFirst({
                        where: {
                            companyId: companyId,
                            endDate: {
                                gte: new Date(_date === null || _date === void 0 ? void 0 : _date.getFullYear(), _date === null || _date === void 0 ? void 0 : _date.getMonth(), 1),
                                lte: new Date(_date.getFullYear(), _date.getMonth() + 1, 0)
                            },
                        },
                        orderBy: {
                            endDate: 'desc'
                        }
                    });
                    if (payPeriodData && payPeriodData.id) {
                        systemPayPeriodId = true;
                        _payPeriodId = payPeriodData.id;
                    }
                }
                if (_payPeriodId) {
                    const validatePayPeriod = yield prisma_1.prisma.payPeriod.findFirst({
                        where: {
                            companyId: companyId,
                            id: _payPeriodId,
                        },
                    });
                    if (!validatePayPeriod) {
                        throw new customError_1.CustomError(400, 'Invalid PayPeriod');
                    }
                }
                const data = {
                    companyId: companyId,
                    page: page,
                    limit: limit,
                    search: String(search),
                    createdBy: String(createdBy),
                    type: String(type),
                    sort: String(sort),
                    classId: String(classId),
                    customerId: String(customerId),
                    employeeId: String(employeeId),
                    payPeriodId: String(_payPeriodId),
                };
                const costAllocation = yield costallocationServices_1.default.getCostAllocationData(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Cost allocation fetched successfully', Object.assign(Object.assign({}, costAllocation), { currentDatePayPeriod: systemPayPeriodId ? _payPeriodId : null }));
            }
            catch (err) {
                next(err);
            }
        });
    }
    exportCostAllocationCSV(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, search = '', type = '', sort = '', classId = '', customerId = '', employeeId = '', payPeriodId = null, } = req.query;
                const data = {
                    companyId: companyId,
                    search: String(search),
                    type: String(type),
                    sort: String(sort),
                    classId: String(classId),
                    customerId: String(customerId),
                    employeeId: String(employeeId),
                    payPeriodId: String(payPeriodId),
                };
                const csvData = yield costallocationServices_1.default.exportCostAllocationCSV(data);
                res.setHeader('Content-Type', 'text/csv');
                const fileName = (0, moment_1.default)(new Date()).format('MMDDYYYYhhmmss');
                res.setHeader('Content-Disposition', `attachment; filename=CostAllocation_${fileName}.csv`);
                return res.status(200).end(csvData);
            }
            catch (err) {
                next(err);
            }
        });
    }
    exportCostAllocationPDF(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, search = '', type = '', sort = '', classId = '', customerId = '', employeeId = '', payPeriodId = null, } = req.query;
                const data = {
                    companyId: companyId,
                    search: String(search),
                    type: String(type),
                    sort: String(sort),
                    classId: String(classId),
                    customerId: String(customerId),
                    employeeId: String(employeeId),
                    payPeriodId: String(payPeriodId),
                };
                const { finalDataArr, counts, filePath, companyName } = yield costallocationServices_1.default.exportCostAllocationPDF(data);
                const stream = yield (0, costAllocationPdf_1.generatePdf)(finalDataArr, counts, filePath, payPeriodId, companyName);
                stream.on('close', () => __awaiter(this, void 0, void 0, function* () {
                    const data = yield fs_1.promises.readFile(filePath);
                    const base64String = Buffer.from(data).toString('base64');
                    yield fs_1.promises.unlink(filePath);
                    res.status(200).json({
                        data: base64String,
                    });
                }));
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new CostAllocationController();
