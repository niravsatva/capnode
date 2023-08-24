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
const employeeCostServices_1 = __importDefault(require("../services/employeeCostServices"));
const customError_1 = require("../models/customError");
class EmployeeConstController {
    // For get the cost by month
    getMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, date, page = 1, limit = 10, search, type, sort, } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!date) {
                    throw new customError_1.CustomError(400, 'Date is required');
                }
                const employeesMonthlyCost = yield employeeCostServices_1.default.getMonthlyCost(companyId, date, Number(page), Number(limit), search, type, sort);
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
                const { companyId, date } = req.body;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!date) {
                    throw new customError_1.CustomError(400, 'Date is required');
                }
                yield employeeCostServices_1.default.createMonthlyCost(companyId, date);
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
                const { employeeCostValueID, value } = req.body;
                if (!employeeCostValueID) {
                    throw new customError_1.CustomError(400, 'Employee Cost value id is required');
                }
                if (!value) {
                    throw new customError_1.CustomError(400, 'Value is required');
                }
                const updatedEmployeeCostValue = yield employeeCostServices_1.default.updateMonthlyCost(employeeCostValueID, value);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', updatedEmployeeCostValue);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new EmployeeConstController();
