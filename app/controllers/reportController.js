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
const reportService_1 = __importDefault(require("../services/reportService"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const customError_1 = require("../models/customError");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
class ReportController {
    getTimeActivitySummaryReport(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield reportService_1.default.getTimeActivitySummaryReport(req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Report fetched successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getExpensesByCustomerReport(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield reportService_1.default.getExpensesByCustomerReport(req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Report fetched successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTimeActivitySummaryReportPdf(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield reportService_1.default.getTimeActivitySummaryReport(req.query);
                const stream = yield reportService_1.default.getTimeActivitySummaryReportPdf(data, req.query);
                const filePath = path_1.default.join(__dirname, '..', 'costAllocationPdfs', `${new Date().getUTCDate()}time-summary-report.pdf`);
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
    getTimeActivitySummaryReportCsv(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield reportService_1.default.getTimeActivitySummaryReport(req.query);
                const csvData = yield reportService_1.default.getTimeActivitySummaryReportCsv(data, req.query);
                res.setHeader('Content-Type', 'text/csv');
                const fileName = (0, moment_1.default)(new Date()).format('MMDDYYYYhhmmss');
                res.setHeader('Content-Disposition', `attachment; filename=TimeActivitySummaryReport_${fileName}.csv`);
                return res.status(200).end(csvData);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getAllPublishedPayrollSummary(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield reportService_1.default.getAllPublishedPayrollSummary(req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Report fetched successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPayrollSummaryReportPdf(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const stream = yield reportService_1.default.getPayrollSummaryReportPdf(req.query);
                // const stream = await reportService.getPayrollSummaryReportPdf(
                // 	data,
                // 	req.query?.companyId as string
                // );
                const filePath = path_1.default.join(__dirname, '..', 'costAllocationPdfs', `${new Date().getUTCDate()}payroll-summary-report.pdf`);
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
    getPayrollSummaryReportCsv(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield reportService_1.default.getAllPublishedPayrollSummary(req.query);
                const csvData = yield reportService_1.default.getPayrollSummaryReportCsv(data, req.query);
                res.setHeader('Content-Type', 'text/csv');
                const fileName = (0, moment_1.default)(new Date()).format('MMDDYYYYhhmmss');
                res.setHeader('Content-Disposition', `attachment; filename=PayrollSummaryReport_${fileName}.csv`);
                return res.status(200).end(csvData);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new ReportController();
