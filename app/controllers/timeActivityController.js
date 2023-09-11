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
const Excel = require('excel4node');
// import moment from 'moment';
const dataExporter = require('json2csv').Parser;
class TimeActivityController {
    getAllTimeActivities(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { page = 1, limit = 10, search = '', classId = '', customerId = '', employeeId = '', type = '', sort = '', startDate = '', endDate = '', } = req.query;
                const companyId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.companyId;
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
                const timeActivities = yield timeActivityServices_1.default.getAllTimeActivitiesServices({
                    companyId: companyId,
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                    classId: String(classId),
                    customerId: String(customerId),
                    employeeId: String(employeeId),
                    type: String(type),
                    sort: String(sort),
                    startDate: String(formattedStartDate),
                    endDate: String(formattedEndDate),
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time Activities fetched successfully', timeActivities);
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
                const { timeActivityId, companyId, hours, minute } = req.body;
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
                (0, validationHelper_1.checkValidation)(req);
                const { timeActivityId, companyId } = req.body;
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
    // Export Time Activity
    exportTimeActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, search = '', classId = '', customerId = '', employeeId = '', startDate = '', endDate = '', } = req.query;
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
                const timeActivities = yield timeActivityServices_1.default.exportTimeActivity(companyId, search, classId, customerId, employeeId, formattedStartDate, formattedEndDate);
                const timeActivityData = JSON.parse(JSON.stringify(timeActivities));
                const fileHeader = [
                    'Activity Date',
                    'Employee Name',
                    'Customer',
                    'Class',
                    'Hours',
                ];
                const jsonData = new dataExporter({ fileHeader });
                const csvData = jsonData.parse(timeActivityData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=sample_data.csv');
                return res.status(200).end(csvData);
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
                const { companyId, search = '', classId = '', customerId = '', employeeId = '', startDate = '', endDate = '', } = req.query;
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
                const timeActivities = yield timeActivityServices_1.default.exportTimeActivity(companyId, search, classId, customerId, employeeId, formattedStartDate, formattedEndDate);
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
                // Add the title (with bold formatting)
                ws.cell(1, 1, 1, 3, true)
                    .string('My Excel Spreadsheet')
                    .style(boldTitleStyle);
                // Add headers
                ws.cell(3, 1).string('Activity Date').style(boldTitleStyle);
                ws.cell(3, 2).string('Employee').style(boldTitleStyle);
                ws.cell(3, 3).string('Customer').style(boldTitleStyle);
                ws.cell(3, 4).string('Class').style(boldTitleStyle);
                ws.cell(3, 5).string('Hrs').style(boldTitleStyle);
                // Add data from JSON
                timeActivities.forEach((item, index) => {
                    ws.cell(index + 4, 1).string(item['Activity Date']);
                    ws.cell(index + 4, 2).string(item['Class']);
                    ws.cell(index + 4, 3).string(item['Customer']);
                    ws.cell(index + 4, 4).string(item['Employee Name']);
                    ws.cell(index + 4, 5).string(item['Hours']);
                });
                // Generate Excel file
                const excelFileName = 'output343334.xlsx';
                wb.write(excelFileName, (err) => {
                    if (err) {
                        console.error('Error writing Excel file:', err);
                        res.status(500).json({ error: 'Error generating Excel file' });
                    }
                    else {
                        console.log('Excel file generated:', excelFileName);
                        res.download(excelFileName, (err) => {
                            if (err) {
                                console.error('Error sending Excel file:', err);
                                res.status(500).json({ error: 'Error sending Excel file' });
                            }
                            else {
                                // Clean up the Excel file after it's sent
                                // fs.unlinkSync(excelFileName);
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
