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
const prisma_1 = require("../client/prisma");
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const global_1 = require("../helpers/global");
const validationHelper_1 = require("../helpers/validationHelper");
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const customError_1 = require("../models/customError");
const employeeCostServices_1 = __importDefault(require("../services/employeeCostServices"));
const moment_1 = __importDefault(require("moment"));
const dataExporter = require('json2csv').Parser;
class EmployeeConstController {
    // For get the cost by month
    getMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, date, page = 1, limit = 10, search, type, sort, isPdf, } = req.query;
                let payPeriodId = req.query.payPeriodId;
                if (!payPeriodId) {
                    const payPeriodData = yield prisma_1.prisma.payPeriod.findFirst({
                        where: {
                            companyId: companyId,
                            OR: [
                                {
                                    startDate: {
                                        lte: new Date(new Date().setUTCHours(23, 59, 59, 999)),
                                    },
                                    endDate: {
                                        gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
                                    },
                                },
                                {
                                    startDate: {
                                        gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
                                    },
                                    endDate: {
                                        lte: new Date(new Date().setUTCHours(23, 59, 59, 999)),
                                    },
                                },
                            ],
                        },
                    });
                    if (payPeriodData && payPeriodData.id) {
                        payPeriodId = payPeriodData.id;
                    }
                }
                // if (!payPeriodId) {
                // 	throw new CustomError(400, 'No Pay Periods Found');
                // }
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                // if (!payPeriodId) {
                // 	throw new CustomError(400, 'Pay period id is required');
                // }
                if (payPeriodId) {
                    const validatePayPeriod = yield prisma_1.prisma.payPeriod.findFirst({
                        where: {
                            companyId: companyId,
                            id: payPeriodId,
                        },
                    });
                    if (!validatePayPeriod) {
                        throw new customError_1.CustomError(400, 'Invalid PayPeriod');
                    }
                }
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Employee Cost',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                let employeesMonthlyCost;
                if (isPdf === 'true') {
                    employeesMonthlyCost = yield employeeCostServices_1.default.getMonthlyCost(companyId, date, Number(page), Number(limit), search, type, sort, payPeriodId);
                }
                else {
                    employeesMonthlyCost = yield employeeCostServices_1.default.getMonthlyCostV2(companyId, date, Number(page), Number(limit), search, type, sort, payPeriodId);
                }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', employeesMonthlyCost);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // For create the cost my month
    createMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, payPeriodId } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!payPeriodId) {
                    throw new customError_1.CustomError(400, 'Pay period id is required');
                }
                yield employeeCostServices_1.default.createMonthlyCost(companyId, payPeriodId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configuration values created successfully');
            }
            catch (error) {
                next(error);
            }
        });
    }
    //For update any single cost
    updateMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeCostValueID, value, payPeriodId, isCalculatorValue } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const updatedEmployeeCostValue = yield employeeCostServices_1.default.updateMonthlyCost(employeeCostValueID, value, payPeriodId, isCalculatorValue);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', updatedEmployeeCostValue);
            }
            catch (error) {
                next(error);
            }
        });
    }
    exportEmployeeCost(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, date, search, type, sort, isPercentage, payPeriodId } = req.query;
                const percentage = isPercentage === 'false' ? false : true;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                const employeesMonthlyCost = yield employeeCostServices_1.default.getMonthlyCostExport(companyId, date, search, type, sort, Boolean(percentage), payPeriodId);
                const finalDataArr = (_a = employeesMonthlyCost === null || employeesMonthlyCost === void 0 ? void 0 : employeesMonthlyCost.employees) === null || _a === void 0 ? void 0 : _a.map((singleEmployee) => {
                    var _a;
                    const sortedData = (_a = singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.employeeCostField) === null || _a === void 0 ? void 0 : _a.sort((a, b) => {
                        // First, sort by field.configurationSection.no
                        if (a.field.configurationSection.no !==
                            b.field.configurationSection.no) {
                            return (a.field.configurationSection.no -
                                b.field.configurationSection.no);
                        }
                        else {
                            // If configurationSection.no values are equal, sort by field.jsonId
                            if (a.field.jsonId < b.field.jsonId) {
                                return -1;
                            }
                            else if (a.field.jsonId > b.field.jsonId) {
                                return 1;
                            }
                            else {
                                return 0;
                            }
                        }
                    });
                    let finalObject = {};
                    sortedData.forEach((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                        finalObject = Object.assign(Object.assign({}, finalObject), { [(_a = item === null || item === void 0 ? void 0 : item.field) === null || _a === void 0 ? void 0 : _a.name]: ((_b = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _b === void 0 ? void 0 : _b.value) === 'salaried_exempt'
                                ? 'Salaried Exempt'
                                : ((_c = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _c === void 0 ? void 0 : _c.value) === 'salaried_non_exempt'
                                    ? 'Salaried Non Exempt'
                                    : ((_d = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _d === void 0 ? void 0 : _d.value) === null
                                        ? 'NA'
                                        : ((_e = item === null || item === void 0 ? void 0 : item.field) === null || _e === void 0 ? void 0 : _e.name) === 'Maximum allocate hours per year'
                                            ? (_f = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _f === void 0 ? void 0 : _f.value
                                            : ((_g = item === null || item === void 0 ? void 0 : item.field) === null || _g === void 0 ? void 0 : _g.name) === 'Maximum Vacation/PTO hours per year'
                                                ? (_h = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _h === void 0 ? void 0 : _h.value
                                                : `$ ${(0, global_1.formatNumberWithCommas)((_j = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _j === void 0 ? void 0 : _j.value)}` });
                    });
                    return Object.assign(Object.assign({ 'Employee Name': singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.fullName }, finalObject), { 'Total Labor Burden': `$ ${(0, global_1.formatNumberWithCommas)(Number(Number(finalObject['Total Salary'].split(',').join('').split('$')[1]) +
                            Number(finalObject['Total Fringe']
                                .split(',')
                                .join('')
                                .split('$')[1]) +
                            Number(finalObject['Total Payroll Taxes']
                                .split(',')
                                .join('')
                                .split('$')[1])).toFixed(2))}` });
                });
                if (percentage) {
                    finalDataArr.forEach((singleEmployee) => {
                        delete singleEmployee['Employee Type'];
                        delete singleEmployee['Maximum allocate hours per year'];
                        delete singleEmployee['Maximum Vacation/PTO hours per year'];
                    });
                }
                const totalObject = {};
                if (finalDataArr.length > 0) {
                    finalDataArr.forEach((singleData) => {
                        Object.entries(singleData).map((singleField) => {
                            if (singleField[0] in totalObject) {
                                console.log('TOTAL: ', totalObject);
                                totalObject[singleField[0]] += Number(singleField[1].split(' ')[1].replace(/,/g, ''));
                            }
                            else {
                                totalObject[singleField[0]] = Number(singleField[1].split(' ')[1].replace(/,/g, ''));
                            }
                        });
                        Object.values(singleData);
                    });
                }
                totalObject['Employee Name'] = 'Total';
                const fileHeader = ['Employee Name', 'Employee Type'];
                const jsonData = new dataExporter({ fileHeader });
                let dateRange;
                let startDate;
                let endDate;
                if (employeesMonthlyCost.payPeriodData) {
                    startDate = (0, moment_1.default)(employeesMonthlyCost.payPeriodData.startDate).format('MM/DD/YYYY');
                    endDate = (0, moment_1.default)(employeesMonthlyCost.payPeriodData.endDate).format('MM/DD/YYYY');
                    dateRange = `${startDate} - ${endDate}`;
                }
                else {
                    dateRange = 'All';
                }
                const extraData = `Report Name ,Employee Cost\n` +
                    `Period ,${dateRange}\n` +
                    `QBO Company's Name ,${(_b = employeesMonthlyCost === null || employeesMonthlyCost === void 0 ? void 0 : employeesMonthlyCost.company) === null || _b === void 0 ? void 0 : _b.tenantName}\n` +
                    `\n`;
                // const exportingData = [...extraData, ...finalDataArr];
                const csvData = jsonData.parse(finalDataArr);
                console.log(JSON.stringify(totalObject));
                // const totalData = jsonData.parse([totalObject]);
                const finalData = csvData +
                    '\n' +
                    JSON.stringify(Object.values(totalObject).map((singleObj, index) => {
                        if (index === 0) {
                            return singleObj;
                        }
                        else {
                            return `$ ${singleObj.toFixed(2)}`;
                        }
                    }))
                        .replace('[', '')
                        .replace(']', '');
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=employee_cost_data.csv');
                return res.status(200).end(extraData + finalData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    employeeCostTotal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, payPeriodId, search } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!payPeriodId) {
                    throw new customError_1.CustomError(400, 'Pay period id is required');
                }
                if (payPeriodId) {
                    const validatePayPeriod = yield prisma_1.prisma.payPeriod.findFirst({
                        where: {
                            companyId: companyId,
                            id: payPeriodId,
                        },
                    });
                    if (!validatePayPeriod) {
                        throw new customError_1.CustomError(400, 'Invalid PayPeriod');
                    }
                }
                const data = yield employeeCostServices_1.default.getMonthlyCostTotal(companyId, payPeriodId, search);
                // const data = await employeeCostServices.getMonthlyCostTotal(
                // 	'acad9ecb-797a-4d43-b354-1a4ebb4bf1c1',
                // 	'3309e3e3-bc0e-45c0-8804-4c15afea65d3'
                // );
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', data);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new EmployeeConstController();
