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
const dashboardServices_1 = __importDefault(require("../services/dashboardServices"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const customError_1 = require("../models/customError");
class DashboardController {
    // Salary Expense By PayPeriod
    getSalaryExpenseByMonth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, year } = req.query;
                const { data, labels, max } = yield dashboardServices_1.default.getSalaryExpenseByPayPeriod(companyId, year);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Journal fetched successfully', {
                    data,
                    labels,
                    max,
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Payroll Expense By Customer
    getExpensesByCustomer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                const expensesByCustomer = yield dashboardServices_1.default.getExpensesByCustomer(companyId, req.query.year);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Expenses by customers fetched successfully', expensesByCustomer);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Cost Allocation Summary
    getJournalGraphData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                const data = yield dashboardServices_1.default.getAllJournalsWithPayPeriod(companyId, req.query.year);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Current Fiscal Years Employee hours
    getEmployeeHoursGraphData(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                const data = yield dashboardServices_1.default.getEmployeeHoursGraphData(req.query.companyId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.query.year);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new DashboardController();
