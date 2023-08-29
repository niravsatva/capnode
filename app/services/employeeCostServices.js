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
/* eslint-disable no-mixed-spaces-and-tabs */
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
class EmployeeCostService {
    getMonthlyCost(companyId, date, page, limit, search, type, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Offset
                const offset = (Number(page) - 1) * Number(limit);
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                // Conditions for search
                const searchCondition = search
                    ? {
                        OR: [
                            {
                                fullName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                        ],
                    }
                    : {};
                // Conditions for sort
                const sortCondition = sort
                    ? {
                        orderBy: {
                            fullName: sort !== null && sort !== void 0 ? sort : 'asc',
                        },
                    }
                    : {};
                // Check which method is activate in company configuration - Hourly Or Percentage
                const configurations = yield configurationRepository_1.default.getCompanyConfiguration(companyId);
                let isPercentage;
                if ((configurations === null || configurations === void 0 ? void 0 : configurations.payrollMethod) === 'Hours') {
                    isPercentage = false;
                }
                else {
                    isPercentage = true;
                }
                const employeesMonthlyCost = yield repositories_1.employeeCostRepository.getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition, isPercentage);
                const count = yield repositories_1.employeeCostRepository.count(companyId, searchCondition);
                return { employees: employeesMonthlyCost, count };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getMonthlyCostExport(companyId, date, search, type, sort, isPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                // Conditions for search
                const searchCondition = search
                    ? {
                        OR: [
                            {
                                fullName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                        ],
                    }
                    : {};
                // Conditions for sort
                const sortCondition = sort
                    ? {
                        orderBy: {
                            fullName: sort !== null && sort !== void 0 ? sort : 'asc',
                        },
                    }
                    : {};
                const employeesMonthlyCost = yield repositories_1.employeeCostRepository.getMonthlyCostExport(companyId, date, searchCondition, sortCondition, isPercentage);
                const count = yield repositories_1.employeeCostRepository.count(companyId, searchCondition);
                return { employees: employeesMonthlyCost, count };
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For create the monthly time cost data
    createMonthlyCost(companyId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                const isValueExist = yield repositories_1.employeeCostRepository.isMonthlyValueCreated(companyId, date);
                if (isValueExist) {
                    return;
                }
                yield repositories_1.employeeCostRepository.createMonth(companyId, date);
                const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
                if (employees.length === 0) {
                    const error = new customError_1.CustomError(404, 'No employee found in this company');
                    throw error;
                }
                const createdMonthlyCosts = yield repositories_1.employeeCostRepository.createMonthlyCost(employees, companyId, date);
                return createdMonthlyCosts;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateMonthlyCost(employeeCostValueID, value, date, isCalculatorValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedEmployeeCostValue = repositories_1.employeeCostRepository.updateMonthlyCost(employeeCostValueID, value, date, isCalculatorValue);
                return updatedEmployeeCostValue;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new EmployeeCostService();
