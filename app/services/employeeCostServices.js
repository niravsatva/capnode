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
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const payPeriodRepository_1 = __importDefault(require("../repositories/payPeriodRepository"));
class EmployeeCostService {
    getMonthlyCost(companyId, date, page, limit, search, type, sort, payPeriodId, includeInactive) {
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
                const sortCondition = {
                    orderBy: {
                        fullName: sort ? sort : 'asc',
                    },
                };
                // Check which method is activate in company configuration - Hourly Or Percentage
                // const configurations =
                // 	await configurationRepository.getCompanyConfiguration(companyId);
                const isPercentage = true;
                // if (configurations?.payrollMethod === 'Hours') {
                // 	isPercentage = false;
                // } else {
                // 	isPercentage = true;
                // }
                let employeesMonthlyCost = [];
                if (payPeriodId) {
                    employeesMonthlyCost = yield repositories_1.employeeCostRepository.getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition, isPercentage, payPeriodId, includeInactive);
                }
                else {
                    employeesMonthlyCost = yield repositories_1.employeeCostRepository.getEmployees(companyId, offset, limit, searchCondition, sortCondition);
                }
                const count = yield repositories_1.employeeCostRepository.count(companyId, searchCondition, includeInactive);
                return { employees: employeesMonthlyCost, count };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getMonthlyCostV2(companyId, date, page, limit, search, type, sort, payPeriodId, systemPayPeriodId, includeInactive) {
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
                const sortCondition = {
                    orderBy: {
                        fullName: sort ? sort : 'asc',
                    },
                };
                // Check which method is activate in company configuration - Hourly Or Percentage
                // const configurations =
                // 	await configurationRepository.getCompanyConfiguration(companyId);
                const isPercentage = true;
                // if (configurations?.payrollMethod === 'Hours') {
                // 	isPercentage = false;
                // } else {
                // 	isPercentage = true;
                // }
                let employeesMonthlyCost = [];
                if (payPeriodId) {
                    employeesMonthlyCost = yield repositories_1.employeeCostRepository.getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition, isPercentage, payPeriodId, includeInactive);
                }
                else {
                    employeesMonthlyCost = yield repositories_1.employeeCostRepository.getEmployees(companyId, offset, limit, searchCondition, sortCondition);
                }
                const employeeCostMappingData = [];
                if (employeesMonthlyCost.length) {
                    employeesMonthlyCost.forEach((singleEmployeeData) => {
                        const obj = {};
                        obj['employeeName'] = singleEmployeeData.fullName;
                        obj['totalLaborBurden'] = '0.00';
                        if (singleEmployeeData && (singleEmployeeData === null || singleEmployeeData === void 0 ? void 0 : singleEmployeeData.employeeCostField)) {
                            singleEmployeeData.employeeCostField.forEach((singleFieldObj) => {
                                if (singleFieldObj && singleFieldObj.field) {
                                    obj[singleFieldObj.field.id] =
                                        singleFieldObj.costValue[0].value;
                                    obj[`value_${singleFieldObj.field.id}`] =
                                        singleFieldObj.costValue[0].id;
                                    obj[`section_${singleFieldObj.field.id}`] =
                                        singleFieldObj.field.configurationSectionId;
                                }
                            });
                        }
                        obj['status'] = singleEmployeeData === null || singleEmployeeData === void 0 ? void 0 : singleEmployeeData.active;
                        employeeCostMappingData.push(obj);
                    });
                }
                const count = yield repositories_1.employeeCostRepository.count(companyId, searchCondition, includeInactive);
                return {
                    employees: employeeCostMappingData,
                    count,
                    payPeriodId: systemPayPeriodId ? payPeriodId : null,
                };
            }
            catch (error) {
                throw error;
            }
        });
    }
    getMonthlyCostTotal(companyId, payPeriodId, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield repositories_1.companyRepository.getDetails(companyId);
            if (!company) {
                const error = new customError_1.CustomError(404, 'Company not found');
                throw error;
            }
            const payPeriod = yield payPeriodRepository_1.default.getDetails(payPeriodId, companyId);
            if (!payPeriod) {
                const error = new customError_1.CustomError(404, 'Pay period not found');
                throw error;
            }
            const employeesMonthlyCost = yield repositories_1.employeeCostRepository.getMonthlyCostTotal(companyId, payPeriodId, search);
            const obj = {
                employeeName: 'Total',
                status: true,
            };
            const companyFields = yield prisma_1.prisma.field.findMany({
                where: {
                    companyId,
                    jsonId: 't1',
                },
            });
            const totalFields = [];
            companyFields.forEach((e) => {
                if (!totalFields.includes(e.id)) {
                    totalFields.push(e.id);
                }
            });
            employeesMonthlyCost.forEach((singleEmployeeData) => {
                singleEmployeeData.employeeCostField.forEach((singleFieldObj) => {
                    if (singleEmployeeData && (singleEmployeeData === null || singleEmployeeData === void 0 ? void 0 : singleEmployeeData.employeeCostField)) {
                        if (obj[singleFieldObj.field.id]) {
                            obj[singleFieldObj.field.id] += Number(singleFieldObj.costValue[0].value);
                        }
                        else {
                            obj[singleFieldObj.field.id] = Number(singleFieldObj.costValue[0].value);
                        }
                    }
                });
            });
            let total = 0;
            Object.keys(obj).forEach((key) => {
                if (totalFields.includes(key)) {
                    total += obj[key];
                }
            });
            obj['totalLaborBurden'] = total;
            return obj;
        });
    }
    getMonthlyCostExport(companyId, date, search, type, sort, isPercentage, payPeriodId, includeInactive) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                let payPeriodData;
                if (payPeriodId) {
                    // Get pay period details
                    payPeriodData = yield payPeriodRepository_1.default.getDetails(payPeriodId, companyId);
                    if (!payPeriodData) {
                        throw new customError_1.CustomError(404, 'Pay period not found');
                    }
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
                const sortCondition = {
                    orderBy: {
                        fullName: sort ? sort : 'asc',
                    },
                };
                const employeesMonthlyCost = yield repositories_1.employeeCostRepository.getMonthlyCostExport(companyId, date, searchCondition, sortCondition, isPercentage, includeInactive, payPeriodId);
                const count = yield repositories_1.employeeCostRepository.count(companyId, searchCondition);
                return { employees: employeesMonthlyCost, count, company, payPeriodData };
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For create the monthly time cost data
    createMonthlyCost(companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                // Check if pay period exists
                const payPeriod = yield payPeriodRepository_1.default.getDetails(payPeriodId, companyId);
                if (!payPeriod) {
                    throw new customError_1.CustomError(404, 'Pay period not found');
                }
                // const isValueExist = await employeeCostRepository.isMonthlyValueCreated(
                // 	companyId,
                // 	date
                // );
                // if (isValueExist) {
                // 	return;
                // }
                // await employeeCostRepository.createMonth(companyId, date);
                const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
                if (employees.length === 0) {
                    const error = new customError_1.CustomError(404, 'No employee found in this company');
                    throw error;
                }
                const createdMonthlyCosts = yield repositories_1.employeeCostRepository.createMonthlyCost(employees, companyId, payPeriodId);
                return createdMonthlyCosts;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateMonthlyCost(employeeCostValueID, value, paPeriodId, isCalculatorValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedEmployeeCostValue = repositories_1.employeeCostRepository.updateMonthlyCost(employeeCostValueID, value, paPeriodId, isCalculatorValue);
                return updatedEmployeeCostValue;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new EmployeeCostService();
