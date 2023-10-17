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
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const customError_1 = require("../models/customError");
const timeSheetServices_1 = __importDefault(require("../services/timeSheetServices"));
const timeSheetRepository_1 = __importDefault(require("../repositories/timeSheetRepository"));
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const prisma_1 = require("../client/prisma");
class TimeSheetController {
    // Get all time sheets
    getAllTimeSheets(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, page = 1, limit = 10, search = '', createdBy = '', type = '', sort = '', payPeriodId = '', } = req.query;
                const data = {
                    companyId: companyId,
                    payPeriodId: payPeriodId,
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                    createdBy: String(createdBy),
                    type: String(type),
                    sort: String(sort),
                };
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Sheets',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const timeSheets = yield timeSheetServices_1.default.getAllTimeSheets(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Sheets fetched successfully', timeSheets);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get time sheet deails
    getTimeSheetDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const timeSheetDetails = yield timeSheetRepository_1.default.getTimeSheetDetails(id);
                if (!timeSheetDetails) {
                    throw new customError_1.CustomError(400, 'Time sheet not found');
                }
                // Checking is the user is permitted
                // const isPermitted = await checkPermission(req, companyId as string, {
                // 	permissionName: 'Time Sheets',
                // 	permission: ['view'],
                // });
                // if (!isPermitted) {
                // 	throw new CustomError(403, 'You are not authorized');
                // }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Sheet fetched successfully', timeSheetDetails);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Create a new time sheet
    createTimeSheet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { name, notes, status, companyId, payPeriodId } = req.body;
                const findExistingTimeSheet = yield prisma_1.prisma.timeSheets.findUnique({
                    where: {
                        payPeriodId,
                    },
                });
                if (findExistingTimeSheet) {
                    // Checking is the user is permitted
                    const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                        permissionName: 'Time Sheets',
                        permission: ['edit'],
                    });
                    if (!isPermitted) {
                        throw new customError_1.CustomError(403, 'You are not authorized');
                    }
                }
                else {
                    // Checking is the user is permitted
                    const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                        permissionName: 'Time Sheets',
                        permission: ['add'],
                    });
                    if (!isPermitted) {
                        throw new customError_1.CustomError(403, 'You are not authorized');
                    }
                }
                const data = {
                    name: name,
                    notes: notes,
                    status: status,
                    companyId: companyId,
                    payPeriodId: payPeriodId,
                    userId: req.user.id,
                    findExistingTimeSheet: findExistingTimeSheet,
                };
                const createdTimeSheet = yield timeSheetServices_1.default.createTimeSheet(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'Time sheet created successfully', createdTimeSheet);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Email time sheet to employee
    emailTimeSheet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, timeSheetId } = req.body;
                const employeeList = req.body.employeeList;
                (0, validationHelper_1.checkValidation)(req);
                const timeSheetData = {
                    timeSheetId: timeSheetId,
                    employeeList: employeeList,
                    companyId: companyId,
                };
                yield timeSheetServices_1.default.emailTimeSheet(timeSheetData);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Email sent successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get time sheet by pay period
    getTimeSheetByPayPeriod(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield timeSheetServices_1.default.getTimeSheetByPayPeriod(req.query.payPeriodId, req.query.companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Timesheet found', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Get all employees by timesheet
    getTimeSheetWiseEmployees(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeSheetId, companyId } = req.query;
                const employees = yield timeSheetServices_1.default.getTimeSheetWiseEmployees(timeSheetId, companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Employees fetched successfully', employees);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Export Time sheet pdf
    exportTimeSheetPdf(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, timeSheetId, employeeId } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const timeSheetData = {
                    timeSheetId: timeSheetId,
                    companyId: companyId,
                    employeeId: employeeId,
                };
                const response = yield timeSheetServices_1.default.exportTimeSheetPdf(timeSheetData);
                return res.status(200).json({
                    data: response.data,
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new TimeSheetController();
