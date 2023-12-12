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
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const costAllocationRepository_1 = __importDefault(require("../repositories/costAllocationRepository"));
const reportPdf_1 = require("../templates/reportPdf");
const utils_1 = require("../utils/utils");
const configurationServices_1 = __importDefault(require("./configurationServices"));
const moment_1 = __importDefault(require("moment"));
const payPeriodRepository_1 = __importDefault(require("../repositories/payPeriodRepository"));
const dataExporter = require('json2csv').Parser;
class ReportService {
    decimalHoursToHHMM(decimalHours) {
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        // Ensure leading zeros if needed
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return formattedHours + ':' + formattedMinutes;
    }
    getTimeActivitySummaryReport(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let subQuery = `SELECT
                                e.id AS employeeId,
                                e."fullName",
                                ta."classId",
                                ta."className",
                                (ROUND(SUM(ta."minute"::numeric) / 60 + SUM(ta."hours"::numeric), 2)) AS _totalHours,
                                TO_CHAR(INTERVAL '1 minute' * (ROUND(SUM(ta."minute"::numeric) + SUM(ta."hours"::numeric) * 60, 0)), 'HH24:MI') AS totalHours
                            FROM
                                public."Employee" e
                            JOIN
                                public."TimeActivities" ta ON e.id = ta."employeeId"
                            WHERE
                                e."companyId" = '${query.companyId}' AND ta."className" IS NOT NULL`;
            if (query.customerId) {
                subQuery += ` AND ta."customerId" = '${query.customerId}'`;
            }
            let timeActivityIds = [];
            if (query.payPeriodId) {
                const payPeriodData = yield prisma_1.prisma.payPeriod.findFirst({
                    where: {
                        id: query.payPeriodId,
                        companyId: query.companyId,
                    },
                    include: {
                        TimeSheets: {
                            include: {
                                timeActivities: true,
                            },
                        },
                    },
                });
                if (payPeriodData &&
                    payPeriodData.isJournalPublished &&
                    ((_a = payPeriodData.TimeSheets) === null || _a === void 0 ? void 0 : _a.timeActivities.length)) {
                    timeActivityIds = (_b = payPeriodData.TimeSheets) === null || _b === void 0 ? void 0 : _b.timeActivities.map((e) => {
                        return e.id;
                    });
                    // subQuery += ` AND ta."activityDate" BETWEEN '${moment(payPeriodData.startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')}' AND '${moment(payPeriodData.endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')}' `
                }
            }
            else if (query.year) {
                const startDateOfYear = new Date(`${Number(query.year)}-01-01T00:00:00.000Z`);
                const endDateOfYear = new Date(`${Number(query.year) + 1}-01-01T00:00:00.000Z`);
                //
                const postedPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                    where: {
                        companyId: query.companyId,
                        isJournalPublished: true,
                        OR: [
                            {
                                startDate: {
                                    gte: startDateOfYear,
                                    lt: endDateOfYear,
                                },
                            },
                            {
                                endDate: {
                                    gte: startDateOfYear,
                                    lt: endDateOfYear,
                                },
                            },
                        ],
                    },
                    include: {
                        TimeSheets: {
                            include: {
                                timeActivities: true,
                            },
                        },
                    },
                });
                if (postedPayPeriods && postedPayPeriods.length) {
                    postedPayPeriods.forEach((period) => {
                        var _a;
                        (_a = period.TimeSheets) === null || _a === void 0 ? void 0 : _a.timeActivities.forEach((e) => {
                            timeActivityIds.push(e.id);
                        });
                    });
                }
            }
            else {
                const postedPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                    where: {
                        companyId: query.companyId,
                        isJournalPublished: true,
                    },
                    include: {
                        TimeSheets: {
                            include: {
                                timeActivities: true,
                            },
                        },
                    },
                });
                if (postedPayPeriods && postedPayPeriods.length) {
                    postedPayPeriods.forEach((period) => {
                        var _a;
                        (_a = period.TimeSheets) === null || _a === void 0 ? void 0 : _a.timeActivities.forEach((e) => {
                            timeActivityIds.push(e.id);
                        });
                    });
                }
            }
            subQuery += ` AND ta."id" IN ('${timeActivityIds.join("', '")}')`;
            subQuery += ` GROUP BY
                                e.id, e."fullName", ta."classId", ta."className"`;
            let rawQuery = `SELECT
                        "employeeid",
                        "fullName",
                        ARRAY_AGG(
                            jsonb_build_object(
                                'classId', "classId",
                                'className', "className",
                                'totalHoursNumber', "_totalhours",
                                'totalHours', "totalhours"
                            )
                        ) AS timeActivities,
                        TO_CHAR(INTERVAL '1 minute' * (ROUND(SUM("_totalhours") * 60, 0)), 'HH24:MI') AS overallTotalHours,
                        SUM("_totalhours") as totalHoursNumber
                    FROM
                        ( ${subQuery} ) AS Employee`;
            if ((0, utils_1.hasText)(query.search)) {
                rawQuery += ` WHERE "fullName" ILIKE '%${query.search}%'`;
            }
            rawQuery += ` GROUP BY
                        employeeid, "fullName"
                    ORDER BY
                        "fullName" ASC`;
            const data = yield prisma_1.prisma.$queryRawUnsafe(rawQuery);
            const distinctClassNameQuery = `SELECT
											DISTINCT "className"
                                    	FROM
											public."TimeActivities"
                                    	WHERE
											"className" IS NOT NULL AND
											"companyId" = '${query.companyId}' AND
											"id" IN ('${timeActivityIds.join("', '")}')`;
            const disTinctClassNames = yield prisma_1.prisma.$queryRawUnsafe(distinctClassNameQuery);
            const classNames = disTinctClassNames.map((e) => {
                return e.className;
            });
            const timeActivitySummary = [];
            let totalHours = 0;
            const totalRow = {};
            data.forEach((entity) => {
                const obj = {
                    id: entity.employeeid,
                    name: entity.fullName,
                    totalHours: entity.overalltotalhours,
                };
                entity.timeactivities.forEach((activity) => {
                    obj[activity.className] = activity.totalHours;
                    if (totalRow[activity.className]) {
                        totalRow[activity.className] =
                            Number(Number(totalRow[activity.className]).toFixed(2)) +
                                Number(activity.totalHoursNumber.toFixed(2));
                    }
                    else {
                        totalRow[activity.className] = activity.totalHoursNumber;
                    }
                });
                totalHours =
                    Number(totalHours.toFixed(2)) +
                        Number(entity.totalhoursnumber.toFixed(2));
                timeActivitySummary.push(obj);
            });
            if (timeActivitySummary.length) {
                classNames.forEach((e) => {
                    if (totalRow[e]) {
                        totalRow[e] = this.decimalHoursToHHMM(Number(totalRow[e]));
                    }
                });
                timeActivitySummary.push(Object.assign(Object.assign({ id: (0, uuid_1.v4)(), name: 'Total' }, totalRow), { totalHours: this.decimalHoursToHHMM(totalHours) }));
            }
            return { timeActivitySummary, classNames };
        });
    }
    getExpensesByCustomerReport(searchParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, year, search } = searchParameters;
            if (!companyId) {
                const error = new customError_1.CustomError(400, 'Company id is required');
                throw error;
            }
            const company = yield repositories_1.companyRepository.getDetails(companyId);
            if (!company) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const _year = year ? year : new Date().getFullYear();
            const startDateOfYear = new Date(`${Number(_year)}-01-01T00:00:00.000Z`);
            const endDateOfYear = new Date(`${Number(_year) + 1}-01-01T00:00:00.000Z`);
            const payPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId,
                    isJournalPublished: true,
                    OR: [
                        {
                            startDate: {
                                gte: startDateOfYear,
                                lt: endDateOfYear,
                            },
                        },
                        {
                            endDate: {
                                gte: startDateOfYear,
                                lt: endDateOfYear,
                            },
                        },
                    ],
                },
            });
            const payPeriodIds = payPeriods.map((e) => {
                return e.id;
            });
            const timeSheets = yield prisma_1.prisma.timeSheets.findMany({
                where: {
                    companyId,
                    payPeriodId: {
                        in: payPeriodIds,
                    },
                },
            });
            let response = [];
            let customerSearchCondition = {};
            if ((0, utils_1.hasText)(search)) {
                customerSearchCondition = {
                    customerName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                };
            }
            for (const timeSheet of timeSheets) {
                const data = {
                    companyId,
                    payPeriodId: timeSheet.payPeriodId,
                    timeSheetId: timeSheet.id,
                    searchCondition: customerSearchCondition,
                };
                const costAllocation = yield costAllocationRepository_1.default.getExpensesByCustomer(data);
                response = [...response, ...costAllocation];
            }
            const finalMapping = {};
            response.forEach((e) => {
                if (finalMapping[e.name]) {
                    finalMapping[e.name].value = finalMapping[e.name].value + e.value;
                }
                else {
                    finalMapping[e.name] = e;
                }
            });
            const finalData = [];
            Object.keys(finalMapping)
                .sort()
                .forEach((key) => {
                finalData.push({
                    name: key,
                    expense: finalMapping[key].value,
                    id: finalMapping[key].id,
                });
            });
            return finalData;
        });
    }
    getTimeActivitySummaryReportPdf(data, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyDetails = yield repositories_1.companyRepository.getDetails(query.companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const filePath = path_1.default.join(__dirname, '..', 'costAllocationPdfs', `${new Date().getUTCDate()}time-summary-report.pdf`);
            const htmlContent = yield (0, reportPdf_1.generateTimeSummaryReportPdf)(data, filePath, companyDetails.tenantName, query);
            return htmlContent;
        });
    }
    getTimeActivitySummaryReportCsv(data, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyDetails = yield repositories_1.companyRepository.getDetails(query.companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const fileHeader = [
                'Employee Name',
                ...data.classNames,
                'Total Hours',
            ];
            const timeActivitySummary = [];
            data.timeActivitySummary.forEach((timeActivity) => {
                const obj = {
                    'Employee Name': timeActivity['name'],
                };
                data.classNames.forEach((e) => {
                    obj[e] = timeActivity[e] ? timeActivity[e] : '';
                });
                obj['Grand Total'] = timeActivity['totalHours'];
                timeActivitySummary.push(obj);
            });
            const jsonData = new dataExporter({ fileHeader });
            let extraData = `Report Name ,Time Summary Report\n`;
            extraData += `QBO Company's Name ,${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName}\n`;
            if (query.payPeriodId) {
                // Pay period date range
                const { startDate, endDate } = yield payPeriodRepository_1.default.getDatesByPayPeriod(query.payPeriodId);
                extraData += `Pay Period ,${(0, moment_1.default)(startDate).format('MM/DD/YYYYY')} - ${(0, moment_1.default)(endDate).format('MM/DD/YYYYY')}\n`;
            }
            extraData += `\n`;
            const csvData = jsonData.parse(timeActivitySummary);
            return extraData + csvData;
        });
    }
    getAllPublishedPayrollSummary(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let payPeriodId = costAllocationData.payPeriodId;
            let isSystemPayPeriod = false;
            if (!payPeriodId) {
                const latestPayPeriodId = yield prisma_1.prisma.payPeriod.findFirst({
                    where: {
                        companyId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.companyId,
                        isJournalPublished: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                if (latestPayPeriodId) {
                    payPeriodId = latestPayPeriodId.id;
                    isSystemPayPeriod = true;
                }
            }
            if (!payPeriodId) {
                return { content: [], currentPayPeriodId: null };
            }
            const payPeriodData = yield prisma_1.prisma.payPeriod.findFirst({
                where: {
                    id: payPeriodId,
                    companyId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.companyId,
                    isJournalPublished: true,
                },
            });
            if (!payPeriodData) {
                throw new customError_1.CustomError(400, 'Invalid PayPeriod');
            }
            // if (costAllocationData?.payPeriodId) {
            // }
            const timeSheetData = yield prisma_1.prisma.timeSheets.findFirst({
                where: {
                    payPeriodId: payPeriodId,
                    companyId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.companyId,
                },
            });
            if (!timeSheetData) {
                return { content: [], currentPayPeriodId: null };
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
                payPeriodId: payPeriodId,
                timeSheetId: timeSheetData.id,
            };
            const data = yield costAllocationRepository_1.default.getCostAllocation(costAllocationRepofilter);
            const finalData = data.result.filter((e) => e.totalRowEmployeeName);
            const sections = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId: costAllocationData.companyId,
                    no: {
                        gt: 0,
                    },
                    payPeriodId
                },
                include: {
                    fields: true,
                },
            });
            const withOutTotalFields = [];
            sections.forEach((section) => {
                section.fields.forEach((field) => {
                    if (field.jsonId.startsWith('f')) {
                        withOutTotalFields.push(field.id);
                    }
                });
            });
            finalData.forEach((e) => {
                e['employee-name'] = e['totalRowEmployeeName'];
                e['total'] = costAllocationRepository_1.default.getRowWiseTotal(e, withOutTotalFields);
            });
            const grandTotalRow = costAllocationRepository_1.default.getGrandTotalRowCostAllocation(finalData);
            if (grandTotalRow) {
                finalData.push(Object.assign(Object.assign({}, grandTotalRow), { id: (0, uuid_1.v4)() }));
            }
            return { content: finalData, currentPayPeriodId: isSystemPayPeriod ? payPeriodId : null };
        });
    }
    getPayrollSummaryReportPdf(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyDetails = yield repositories_1.companyRepository.getDetails(query.companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const sections = yield configurationServices_1.default.getFieldsSection(query.companyId, query.payPeriodId);
            const headers = [];
            sections.forEach((section) => {
                if (section.no != 0) {
                    section.fields.forEach((field) => {
                        if (field.isActive && field.jsonId.startsWith('f')) {
                            headers.push({ name: field.name, value: field.id });
                        }
                    });
                }
            });
            const data = yield this.getAllPublishedPayrollSummary(query);
            const filePath = path_1.default.join(__dirname, '..', 'costAllocationPdfs', `${new Date().getUTCDate()}payroll-summary-report.pdf`);
            const finalData = yield (0, reportPdf_1.generatePayrollSummaryReportPdf)(data.content, headers, filePath, companyDetails.tenantName, query);
            return finalData;
        });
    }
    getPayrollSummaryReportCsv(data, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyDetails = yield repositories_1.companyRepository.getDetails(query.companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const sections = yield configurationServices_1.default.getFieldsSection(query.companyId, query.payPeriodId);
            const headers = [];
            sections.forEach((section) => {
                if (section.no != 0) {
                    section.fields.forEach((field) => {
                        if (field.isActive && field.jsonId.startsWith('f')) {
                            headers.push({ name: field.name, value: field.id });
                        }
                    });
                }
            });
            const finalDataArr = data.map((singleData) => {
                const obj = {};
                obj['Employee Name'] = singleData['employee-name'];
                obj['Allocation'] = singleData['allocation'];
                headers.forEach((header) => {
                    obj[header.name] = singleData[header.value]
                        ? `$${Number(singleData[header.value]).toFixed(2)}`
                        : `$0.00`;
                });
                obj['Total'] = `$${Number(singleData['total']).toFixed(2)}`;
                return obj;
            });
            const fileHeader = ['Employee Name', 'Total Hours'];
            const jsonData = new dataExporter({ fileHeader });
            let extraData = `Report Name ,Payroll Summary Report\n`;
            extraData += `QBO Company's Name ,${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName}\n`;
            if (query.payPeriodId) {
                // Pay period date range
                const { startDate, endDate } = yield payPeriodRepository_1.default.getDatesByPayPeriod(query.payPeriodId);
                extraData += `Pay Period ,${(0, moment_1.default)(startDate).format('MM/DD/YYYYY')} - ${(0, moment_1.default)(endDate).format('MM/DD/YYYYY')}\n`;
            }
            extraData += `\n`;
            const csvData = jsonData.parse(finalDataArr);
            return extraData + csvData;
        });
    }
}
exports.default = new ReportService();
