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
const timeActivityServices_1 = __importDefault(require("../services/timeActivityServices"));
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
const Excel = require('excel4node');
// import moment from 'moment';
const dataExporter = require('json2csv').Parser;
class TimeActivityController {
    getAllTimeActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { page = 1, limit = 10, search = '', classId = '', customerId = '', employeeId = '', type = '', sort = '', isOverHours = false, payPeriodId = '', companyId = '', year = '', } = req.query;
                // if (!payPeriodId) {
                // 	throw new CustomError(400, 'Pay Period Id is required');
                // }
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Logs',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const { timeActivitiesWithHours, timeActivitiesCount } = yield timeActivityServices_1.default.getAllTimeActivitiesServices({
                    companyId: String(companyId),
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                    classId: String(classId),
                    customerId: String(customerId),
                    employeeId: String(employeeId),
                    type: String(type),
                    sort: String(sort),
                    isOverHours: isOverHours === 'false'
                        ? false
                        : isOverHours === 'true'
                            ? true
                            : '',
                    payPeriodId: String(payPeriodId),
                    year: String(year),
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Activities fetched successfully', {
                    timeActivities: timeActivitiesWithHours,
                    timeActivitiesCount: timeActivitiesCount,
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    syncTimeActivities(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const companyId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.companyId;
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Checking is the user is permitted
                const isAddPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Logs',
                    permission: ['add'],
                });
                // Checking is the user is permitted
                const isEditPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Logs',
                    permission: ['edit'],
                });
                if (!isAddPermitted && !isEditPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                // Check if company is connected
                if (companyDetails.isConnected == false) {
                    throw new customError_1.CustomError(400, 'Company is not connected');
                }
                // Check if company is active
                if (companyDetails.status == false) {
                    throw new customError_1.CustomError(400, 'Company status is not active');
                }
                yield timeActivityServices_1.default.syncTimeActivityByLastSync(companyId);
                // await timeActivityServices.syncTimeActivities(companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Activities synced successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
    updateTimeActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { timeActivityId, companyId, hours, minute, classId, className, customerId, customerName, } = req.body;
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Logs',
                    permission: ['edit'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                // Update service
                const updatedTimeActivity = yield timeActivityServices_1.default.updateTimeActivity({
                    timeActivityId,
                    companyId,
                    hours,
                    minute,
                    classId,
                    className,
                    customerId,
                    customerName,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time activity updated successfully', updatedTimeActivity);
            }
            catch (err) {
                next(err);
            }
        });
    }
    createTimeActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { companyId, hours, minute, classId, className, customerId, customerName, activityDate, employeeId, } = req.body;
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                if (!classId || !customerId || !employeeId) {
                    throw new customError_1.CustomError(400, 'ClassId, CustomerId and EmployeeId are required');
                }
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Logs',
                    permission: ['add'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                // Create service
                const createTimeActivity = yield timeActivityServices_1.default.createTimeActivity({
                    companyId,
                    hours,
                    minute,
                    classId,
                    className,
                    customerId,
                    customerName,
                    activityDate,
                    employeeId,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'Time activity created successfully', createTimeActivity);
            }
            catch (err) {
                next(err);
            }
        });
    }
    deleteTimeActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeActivityId, companyId } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Time Logs',
                    permission: ['delete'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                yield timeActivityServices_1.default.deleteTimeActivity({
                    companyId: companyId,
                    timeActivityId: timeActivityId,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Activity deleted successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Export Time Activity CSV
    exportTimeActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, search = '', classId = '', customerId = '', employeeId = '', payPeriodId = '', sort = '', type = '', } = req.query;
                const { timeActivities, companyDetails, payPeriodData } = yield timeActivityServices_1.default.exportTimeActivity(companyId, search, classId, customerId, employeeId, payPeriodId, sort, type);
                const timeActivityData = JSON.parse(JSON.stringify(timeActivities));
                const fileHeader = [
                    'Activity Date',
                    'Employee Name',
                    'Customer',
                    'Class',
                    'Hours',
                ];
                const jsonData = new dataExporter({ fileHeader });
                let dateRange;
                let startDate;
                let endDate;
                if (payPeriodData) {
                    startDate = (0, moment_1.default)(payPeriodData.startDate).format('MM/DD/YYYY');
                    endDate = (0, moment_1.default)(payPeriodData.endDate).format('MM/DD/YYYY');
                    dateRange = `${startDate} - ${endDate}`;
                }
                else {
                    dateRange = 'All';
                }
                const extraData = `Report Name ,Time Logs\n` +
                    `Period ,${dateRange}\n` +
                    `QBO Company's Name ,${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName}\n` +
                    `\n`;
                const csvData = jsonData.parse(timeActivityData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=sample_data.csv');
                return res.status(200).end(extraData + csvData);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Export Pdf
    exportTimeActivityPdf(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const htmlData = req.body.html;
                const fileName = req.body.fileName;
                const response = yield axios_1.default.post('https://pdf.satvasolutions.com/api/ConvertHtmlToPdf', {
                    FileName: fileName,
                    HtmlData: htmlData,
                });
                return res.status(200).json({
                    data: response.data,
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Export Excel
    exportTimeActivityExcel(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, search = '', classId = '', customerId = '', employeeId = '', startDate = '', endDate = '', payPeriodId = '', sort = '', type = '', } = req.query;
                let formattedStartDate = '';
                let formattedEndDate = '';
                if (startDate && endDate) {
                    // Format start date
                    const newStart = new Date(startDate);
                    newStart.setUTCHours(0, 0, 0, 0);
                    formattedStartDate = newStart.toISOString();
                    // Format end date
                    const newEnd = new Date(endDate);
                    newEnd.setUTCHours(0, 0, 0, 0);
                    formattedEndDate = newEnd.toISOString();
                }
                const { timeActivities, companyDetails } = yield timeActivityServices_1.default.exportTimeActivity(companyId, search, classId, customerId, employeeId, payPeriodId, sort, type);
                // Create a new Excel workbook and worksheet
                const wb = new Excel.Workbook();
                const ws = wb.addWorksheet('Sheet 1');
                // Define Excel styles
                const boldTitleStyle = wb.createStyle({
                    font: {
                        bold: true,
                        size: 14,
                    },
                    alignment: {
                        horizontal: 'center',
                    },
                });
                let fileName = '';
                let dateRange = '';
                if (startDate && endDate) {
                    fileName =
                        formattedStartDate === formattedEndDate
                            ? `${(0, moment_1.default)(formattedEndDate).format('MM-DD-YYYY')}`
                            : `${(0, moment_1.default)(formattedStartDate).format('MM-DD-YYYY')} - ${(0, moment_1.default)(formattedEndDate).format('MM-DD-YYYY')}`;
                    dateRange =
                        formattedStartDate === formattedEndDate
                            ? `${(0, moment_1.default)(formattedEndDate).format('MM-DD-YYYY')}`
                            : `${(0, moment_1.default)(formattedStartDate).format('MM-DD-YYYY')} - ${(0, moment_1.default)(formattedEndDate).format('MM-DD-YYYY')}`;
                }
                else {
                    fileName = (0, moment_1.default)().format('MM-DD-YYYY');
                    dateRange = 'All';
                }
                // Add the title (with bold formatting)
                ws.cell(1, 1, true).string('Report Name:');
                ws.cell(1, 2, true).string('Time Log Activity');
                ws.cell(2, 1).string('Period');
                ws.cell(2, 2).string(dateRange);
                ws.cell(3, 1).string("QBO Company's Name");
                ws.cell(3, 2).string(companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName);
                // Add headers
                ws.cell(5, 1).string('Activity Date').style(boldTitleStyle);
                ws.cell(5, 2).string('Employee').style(boldTitleStyle);
                ws.cell(5, 3).string('Customer').style(boldTitleStyle);
                ws.cell(5, 4).string('Class').style(boldTitleStyle);
                ws.cell(5, 5).string('Hours').style(boldTitleStyle);
                // Add data from JSON
                timeActivities.forEach((item, index) => {
                    ws.cell(index + 6, 1).string(item['Activity Date']);
                    ws.cell(index + 6, 2).string(item['Class']);
                    ws.cell(index + 6, 3).string(item['Customer']);
                    ws.cell(index + 6, 4).string(item['Employee Name']);
                    ws.cell(index + 6, 5).string(item['Hours']);
                });
                // Generate Excel file
                const excelFileName = `${fileName}.xlsx`;
                wb.write(excelFileName, (err) => {
                    if (err) {
                        logger_1.logger.error('Error writing Excel file:', err);
                        res.status(500).json({ error: 'Error generating Excel file' });
                    }
                    else {
                        res.download(excelFileName, (err) => {
                            if (err) {
                                logger_1.logger.error('Error sending Excel file:', err);
                                res.status(500).json({ error: 'Error sending Excel file' });
                            }
                            else {
                                // Clean up the Excel file after it's sent
                                fs_1.default.unlinkSync(excelFileName);
                            }
                        });
                    }
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new TimeActivityController();
