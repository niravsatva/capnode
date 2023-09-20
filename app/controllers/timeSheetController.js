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
const repositories_1 = require("../repositories");
const timeSheetServices_1 = __importDefault(require("../services/timeSheetServices"));
class TimeSheetController {
    getAllTimeSheets(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, page = 1, limit = 10, search = '', createdBy = '', type = '', sort = '', startDate = '', endDate = '', } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(404, 'Company id is required');
                }
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                let formattedStartDate = '';
                let formattedEndDate = '';
                if (startDate && endDate) {
                    // Format start date
                    const newStart = new Date(startDate);
                    newStart.setUTCHours(0, 0, 0, 0);
                    formattedStartDate = newStart.toISOString();
                    // Format end date
                    const newEnd = new Date(endDate);
                    const nextDate = new Date(newEnd);
                    nextDate.setDate(newEnd.getDate() + 1);
                    nextDate.setUTCHours(0, 0, 0, 0);
                    formattedEndDate = nextDate.toISOString();
                }
                const data = {
                    companyId: companyId,
                    page: page,
                    limit: limit,
                    search: String(search),
                    createdBy: String(createdBy),
                    type: String(type),
                    sort: String(sort),
                    startDate: String(formattedStartDate),
                    endDate: String(formattedEndDate),
                };
                const timeSheets = yield timeSheetServices_1.default.getAllTimeSheets(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Sheets fetched successfully', timeSheets);
            }
            catch (err) {
                next(err);
            }
        });
    }
    createTimeSheetByDate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, name, startDate = '', endDate = '', notes, status, } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found.');
                }
                let formattedStartDate = '';
                let formattedEndDate = '';
                if (startDate && endDate) {
                    // Format start date
                    const newStart = new Date(startDate);
                    newStart.setUTCHours(0, 0, 0, 0);
                    console.log('New start date: ' + newStart);
                    formattedStartDate = newStart.toISOString();
                    // Format end date
                    const newEnd = new Date(endDate);
                    newEnd.setUTCHours(0, 0, 0, 0);
                    formattedEndDate = newEnd.toISOString();
                }
                const user = req.user;
                const data = {
                    companyId: companyId,
                    name: name,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    notes: notes,
                    status: status,
                    user: user,
                };
                const timeSheet = yield timeSheetServices_1.default.createTimeSheetByDate(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time sheet created successfully', timeSheet);
            }
            catch (err) {
                next(err);
            }
        });
    }
    createTimeSheet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, name, totalHours, totalMinutes, notes, status } = req.body;
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const user = req.user;
                const data = {
                    companyId: companyId,
                    name: name,
                    totalHours: totalHours,
                    totalMinutes: totalMinutes,
                    notes: notes,
                    status: status,
                    user: user,
                };
                const createdTimeSheet = yield timeSheetServices_1.default.createTimeSheet(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'Time sheet created successfully', createdTimeSheet);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getAllTimeSheetLogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, timeSheetId } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(404, 'Company id is required');
                }
                if (!timeSheetId) {
                    throw new customError_1.CustomError(404, 'Time sheet id is required');
                }
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const timeSheetLogs = yield timeSheetServices_1.default.getTimeSheetLogs(timeSheetId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time sheet employee logs successfully', timeSheetLogs);
            }
            catch (err) {
                next(err);
            }
        });
    }
    emailTimeSheet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, timeSheetId } = req.body;
                const employeeList = req.body.employeeList;
                if (!companyId) {
                    throw new customError_1.CustomError(404, 'Company id is required');
                }
                if (!employeeList) {
                    throw new customError_1.CustomError(404, 'Employee List array is required');
                }
                if (!timeSheetId) {
                    throw new customError_1.CustomError(404, 'Time sheet id is required');
                }
                if (employeeList.length == 0) {
                    throw new customError_1.CustomError(404, 'Employee List array is required');
                }
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
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
}
exports.default = new TimeSheetController();
