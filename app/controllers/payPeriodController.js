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
const payPeriodServices_1 = __importDefault(require("../services/payPeriodServices"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const customError_1 = require("../models/customError");
const validationHelper_1 = require("../helpers/validationHelper");
class PayPeriodController {
    getAllPayPeriods(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, year, page = 1, limit = 10 } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                const data = {
                    companyId,
                    year: Number(year),
                    page: Number(page),
                    limit: Number(limit),
                };
                const payPeriods = yield payPeriodServices_1.default.getAllPayPeriods(data);
                const count = yield payPeriodServices_1.default.count(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Get all pay periods', payPeriods, count);
            }
            catch (err) {
                next(err);
            }
        });
    }
    createPayPeriod(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, startDate, endDate } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const data = {
                    companyId: companyId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                };
                console.log('DATA: ', data);
                const payPeriodData = yield payPeriodServices_1.default.createNewPayPeriod(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'Pay period created successfully', payPeriodData);
            }
            catch (err) {
                next(err);
            }
        });
    }
    editPayPeriod(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { companyId, startDate, endDate } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const newStartDate = new Date(startDate);
                const newEndDate = new Date(endDate);
                if (newEndDate < newStartDate) {
                    throw new customError_1.CustomError(400, 'Star date must be before end date');
                }
                const data = {
                    id: id,
                    companyId: companyId,
                    startDate: newStartDate,
                    endDate: newEndDate,
                };
                const payPeriodData = yield payPeriodServices_1.default.editPayPeriod(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Pay Period updated successfully', payPeriodData);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getDisabledDate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const disabledDate = yield payPeriodServices_1.default.getAllPayPeriodDates(req.query.companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Pay Period Dates', disabledDate);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new PayPeriodController();
