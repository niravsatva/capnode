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
/* eslint-disable @typescript-eslint/no-var-requires */
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const costAllocationRepository_1 = __importDefault(require("../repositories/costAllocationRepository"));
const payPeriodRepository_1 = __importDefault(require("../repositories/payPeriodRepository"));
const timeSheetRepository_1 = __importDefault(require("../repositories/timeSheetRepository"));
const path_1 = __importDefault(require("path"));
const dataExporter = require('json2csv').Parser;
class CostAllocationServices {
    getCostAllocationData(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.payPeriodId) {
                const payPeriodData = yield prisma_1.prisma.payPeriod.findFirst({
                    where: {
                        id: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.payPeriodId,
                        companyId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.companyId
                    }
                });
                if (!payPeriodData) {
                    throw new customError_1.CustomError(400, 'Invalid PayPeriod');
                }
            }
            const timeSheetData = yield prisma_1.prisma.timeSheets.findFirst({
                where: {
                    payPeriodId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.payPeriodId,
                    companyId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.companyId
                },
            });
            if (!timeSheetData) {
                return { result: [], employeeRowSpanMapping: {} };
            }
            const offset = (Number(costAllocationData.page) - 1) * Number(costAllocationData.limit);
            const filteredData = [];
            const empFilteredData = [];
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId) {
                filteredData.push({ classId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId) {
                filteredData.push({ customerId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId) {
                empFilteredData.push({
                    id: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId,
                });
            }
            const empFilterConditions = (empFilteredData === null || empFilteredData === void 0 ? void 0 : empFilteredData.length) > 0
                ? {
                    AND: empFilteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const filterConditions = (filteredData === null || filteredData === void 0 ? void 0 : filteredData.length) > 0
                ? {
                    AND: filteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const searchCondition = costAllocationData.search
                ? {
                    OR: [
                        {
                            className: {
                                contains: costAllocationData.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            customerName: {
                                contains: costAllocationData.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            employee: {
                                fullName: {
                                    contains: costAllocationData.search,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    ],
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            // Conditions for sort
            const sortCondition = {
                orderBy: [],
            };
            if (costAllocationData.sort) {
                sortCondition.orderBy.push({
                    [costAllocationData.sort]: (_a = costAllocationData.type) !== null && _a !== void 0 ? _a : 'asc',
                });
            }
            sortCondition.orderBy.push({
                id: 'desc',
            });
            costAllocationData.timeSheetId = String(timeSheetData.id);
            const costAllocationRepofilter = {
                companyId: costAllocationData.companyId,
                offset: offset,
                type: costAllocationData.type,
                limit: Number(costAllocationData.limit),
                searchCondition,
                sortCondition,
                filterConditions,
                empFilterConditions,
                classId: String(costAllocationData.classId),
                customerId: String(costAllocationData.customerId),
                employeeId: String(costAllocationData.employeeId),
                isPercentage: costAllocationData.isPercentage,
                payPeriodId: costAllocationData.payPeriodId,
                timeSheetId: timeSheetData.id,
            };
            const data = costAllocationRepository_1.default.getCostAllocation(costAllocationRepofilter);
            return data;
        });
    }
    exportCostAllocationCSV(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId } = costAllocationData;
            if (!companyId) {
                throw new customError_1.CustomError(400, 'Company id is required');
            }
            if (!payPeriodId) {
                throw new customError_1.CustomError(400, 'Pay period id is required');
            }
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const payPeriodDetails = yield payPeriodRepository_1.default.getDetails(payPeriodId, companyId);
            if (!payPeriodDetails) {
                throw new customError_1.CustomError(400, 'Invalid Pay Period');
            }
            const timeSheet = yield timeSheetRepository_1.default.getTimeSheetByPayPeriod(payPeriodId);
            const filteredData = [];
            const empFilteredData = [];
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId) {
                filteredData.push({ classId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId) {
                filteredData.push({ customerId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId) {
                empFilteredData.push({
                    id: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId,
                });
            }
            const empFilterConditions = (empFilteredData === null || empFilteredData === void 0 ? void 0 : empFilteredData.length) > 0
                ? {
                    AND: empFilteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const filterConditions = (filteredData === null || filteredData === void 0 ? void 0 : filteredData.length) > 0
                ? {
                    AND: filteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const searchCondition = costAllocationData.search
                ? {
                    OR: [
                        {
                            fullName: {
                                mode: 'insensitive',
                                contains: costAllocationData.search,
                            },
                        },
                    ],
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            // Conditions for sort
            const sortCondition = {
                orderBy: [],
            };
            if (costAllocationData.sort) {
                sortCondition.orderBy.push({
                    [costAllocationData.sort]: (_a = costAllocationData.type) !== null && _a !== void 0 ? _a : 'asc',
                });
            }
            sortCondition.orderBy.push({
                id: 'desc',
            });
            const data = {
                companyId: costAllocationData.companyId,
                type: costAllocationData.type,
                searchCondition,
                sortCondition,
                filterConditions,
                empFilterConditions,
                classId: String(costAllocationData.classId),
                customerId: String(costAllocationData.customerId),
                employeeId: String(costAllocationData.employeeId),
                isPercentage: costAllocationData.isPercentage,
                payPeriodId: costAllocationData.payPeriodId,
                timeSheetId: timeSheet && timeSheet.id,
            };
            const costAllocation = yield costAllocationRepository_1.default.getCostAllocation(data);
            const sectionWiseFields = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId: companyId,
                    no: {
                        gt: 0,
                    },
                },
                include: {
                    fields: {
                        orderBy: {
                            jsonId: 'asc',
                        },
                    },
                },
                orderBy: {
                    no: 'asc',
                },
            });
            const finalFieldMapping = {
                'employee-name': 'Employee Name',
                'customer-name': 'Customer Name',
                'class-name': 'Class Name',
                'total-hours': 'Total Hours',
                allocation: 'Allocation',
            };
            sectionWiseFields.forEach((singleSection) => {
                singleSection.fields.forEach((singleField) => {
                    finalFieldMapping[singleField.id] = singleField.name;
                });
            });
            finalFieldMapping['indirect-allocation'] = 'Indirect Allocation';
            const finalDataArr = [];
            costAllocation.result.forEach((singleAllocation) => {
                const obj = {};
                Object.keys(finalFieldMapping).forEach((key) => {
                    if (singleAllocation[key] != undefined &&
                        singleAllocation[key] != null) {
                        obj[finalFieldMapping[key]] =
                            typeof singleAllocation[key] === 'number'
                                ? `$ ${Number(singleAllocation[key]).toFixed(4)}`
                                : singleAllocation[key];
                    }
                });
                finalDataArr.push(obj);
            });
            const costAllocationDataArr = JSON.parse(JSON.stringify(finalDataArr));
            const fileHeader = [
                'Activity Date',
                'Employee Name',
                'Customer',
                'Class',
                'Hours',
            ];
            const jsonData = new dataExporter({ fileHeader });
            const csvData = jsonData.parse(costAllocationDataArr);
            // Pay period date range
            const { startDate, endDate } = yield payPeriodRepository_1.default.getDatesByPayPeriod(payPeriodId);
            const extraData = `Report Name ,Cost Allocations\n` +
                `Period ,${(0, moment_1.default)(startDate).format('MM/DD/YYYYY')} - ${(0, moment_1.default)(endDate).format('MM/DD/YYYYY')}\n` +
                `QBO Company's Name ,${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName}\n` +
                `\n`;
            return extraData + csvData;
        });
    }
    exportCostAllocationPDF(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId } = costAllocationData;
            if (!companyId) {
                throw new customError_1.CustomError(400, 'Company id is required');
            }
            if (!payPeriodId) {
                throw new customError_1.CustomError(400, 'Pay period id is required');
            }
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const payPeriodDetails = yield payPeriodRepository_1.default.getDetails(payPeriodId, companyId);
            if (!payPeriodDetails) {
                throw new customError_1.CustomError(400, 'Invalid Pay Period');
            }
            const timeSheet = yield timeSheetRepository_1.default.getTimeSheetByPayPeriod(payPeriodId);
            const filteredData = [];
            const empFilteredData = [];
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId) {
                filteredData.push({ classId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId) {
                filteredData.push({ customerId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId) {
                empFilteredData.push({
                    id: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId,
                });
            }
            const empFilterConditions = (empFilteredData === null || empFilteredData === void 0 ? void 0 : empFilteredData.length) > 0
                ? {
                    AND: empFilteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const filterConditions = (filteredData === null || filteredData === void 0 ? void 0 : filteredData.length) > 0
                ? {
                    AND: filteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const searchCondition = costAllocationData.search
                ? {
                    OR: [
                        {
                            fullName: {
                                mode: 'insensitive',
                                contains: costAllocationData.search,
                            },
                        },
                    ],
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            // Conditions for sort
            const sortCondition = {
                orderBy: [],
            };
            if (costAllocationData.sort) {
                sortCondition.orderBy.push({
                    [costAllocationData.sort]: (_a = costAllocationData.type) !== null && _a !== void 0 ? _a : 'asc',
                });
            }
            sortCondition.orderBy.push({
                id: 'desc',
            });
            const data = {
                companyId: costAllocationData.companyId,
                type: costAllocationData.type,
                searchCondition,
                sortCondition,
                filterConditions,
                empFilterConditions,
                classId: String(costAllocationData.classId),
                customerId: String(costAllocationData.customerId),
                employeeId: String(costAllocationData.employeeId),
                isPercentage: costAllocationData.isPercentage,
                payPeriodId: costAllocationData.payPeriodId,
                timeSheetId: timeSheet && timeSheet.id,
            };
            const costAllocation = yield costAllocationRepository_1.default.getCostAllocation(data);
            const sectionWiseFields = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId: companyId,
                    no: {
                        gt: 0,
                    },
                },
                include: {
                    fields: {
                        orderBy: {
                            jsonId: 'asc',
                        },
                    },
                },
                orderBy: {
                    no: 'asc',
                },
            });
            let salaryExpenseAccounts = 0;
            let fringeExpense = 0;
            let payrollTaxesExpense = 0;
            sectionWiseFields.forEach((singleField) => {
                if (singleField['sectionName'] === 'Salary Expense Accounts') {
                    salaryExpenseAccounts = singleField.fields.length;
                }
                else if (singleField['sectionName'] === 'Fringe expense') {
                    fringeExpense = singleField.fields.length;
                }
                else if (singleField['sectionName'] === 'Payroll Taxes Expense') {
                    payrollTaxesExpense = singleField.fields.length;
                }
            });
            const counts = {
                salaryExpenseAccounts,
                fringeExpense,
                payrollTaxesExpense,
            };
            const finalFieldMapping = {
                'employee-name': 'Employee Name',
                'customer-name': 'Customer Name',
                'class-name': 'Class Name',
                'total-hours': 'Total Hours',
                allocation: 'Allocation',
            };
            sectionWiseFields.forEach((singleSection) => {
                singleSection.fields.forEach((singleField) => {
                    finalFieldMapping[singleField.id] = singleField.name;
                });
            });
            finalFieldMapping['indirect-allocation'] = 'Indirect Allocation';
            const finalDataArr = [];
            costAllocation.result.forEach((singleAllocation) => {
                const obj = {};
                Object.keys(finalFieldMapping).forEach((key) => {
                    if (singleAllocation[key] != undefined &&
                        singleAllocation[key] != null) {
                        obj[finalFieldMapping[key]] =
                            typeof singleAllocation[key] === 'number'
                                ? `$ ${Number(singleAllocation[key]).toFixed(key === 'allocation' ? 4 : 2)}`
                                : singleAllocation[key];
                    }
                });
                finalDataArr.push(obj);
            });
            const filePath = path_1.default.join(__dirname, '..', 'costAllocationPdfs', `${new Date().getUTCDate()}CostAllocation.pdf`);
            const companyName = companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName;
            return { finalDataArr, counts, filePath, companyName };
        });
    }
}
exports.default = new CostAllocationServices();
