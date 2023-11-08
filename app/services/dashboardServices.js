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
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const prisma_1 = require("../client/prisma");
const dashboardRepository_1 = __importDefault(require("../repositories/dashboardRepository"));
const costAllocationRepository_1 = __importDefault(require("../repositories/costAllocationRepository"));
const moment_1 = __importDefault(require("moment"));
class DashboardServices {
    getSalaryExpenseByMonthService(companyId, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const journals = yield dashboardRepository_1.default.getSalaryExpenseByMonth(companyId, year);
            const labels = [];
            const data = [];
            const obj = {};
            journals.forEach((singleJournal) => {
                const month = new Date(singleJournal === null || singleJournal === void 0 ? void 0 : singleJournal.date).getMonth() + 1;
                if (obj[month]) {
                    obj[month] = Number(obj[month]) + Number(singleJournal === null || singleJournal === void 0 ? void 0 : singleJournal.amount);
                }
                else {
                    obj[month] = Number(singleJournal === null || singleJournal === void 0 ? void 0 : singleJournal.amount);
                }
            });
            Object.entries(obj).forEach((singleData) => {
                const currentYear = year || new Date().getFullYear();
                labels.push(`${singleData[0]}-${currentYear}`);
                data.push(Number(Number(singleData[1]).toFixed(2)));
            });
            const number = Math.max(...data);
            const nearest1000 = Math.ceil(number / 1000) * 1000;
            const max = nearest1000 > number ? nearest1000 : nearest1000 + 1000;
            return { data, labels, max };
        });
    }
    getExpensesByCustomer(companyId, currentYear) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!companyId) {
                const error = new customError_1.CustomError(400, 'Company id is required');
                throw error;
            }
            const company = yield repositories_1.companyRepository.getDetails(companyId);
            if (!company) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const year = currentYear ? currentYear : new Date().getFullYear();
            const startDateOfYear = new Date(`${Number(year)}-01-01T00:00:00.000Z`);
            const endDateOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
            const payPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId,
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
            for (const timeSheet of timeSheets) {
                const data = {
                    companyId,
                    payPeriodId: timeSheet.payPeriodId,
                    timeSheetId: timeSheet.id,
                };
                const costAllocation = yield costAllocationRepository_1.default.getExpensesByCustomer(data);
                response = [...response, ...costAllocation];
            }
            const finalMapping = {};
            response.forEach((e) => {
                if (finalMapping[e.name]) {
                    finalMapping[e.name] = finalMapping[e.name] + e.value;
                }
                else {
                    finalMapping[e.name] = e.value;
                }
            });
            const labels = [];
            const values = [];
            Object.keys(finalMapping)
                .sort()
                .forEach((key) => {
                labels.push(key);
                values.push(finalMapping[key]);
            });
            return { labels, values };
        });
    }
    getSalaryExpenseByPayPeriod(companyId, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = year ? year : new Date().getFullYear();
            const startDateOfYear = new Date(`${Number(currentYear)}-01-01T00:00:00.000Z`);
            const endDateOfYear = new Date(`${Number(currentYear) + 1}-01-01T00:00:00.000Z`);
            const currentYearPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId,
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
            const payPeriodIds = currentYearPayPeriods.map((payPeriod) => {
                return payPeriod.id;
            });
            const journalData = yield prisma_1.prisma.journal.findMany({
                where: {
                    companyId,
                    payPeriodId: {
                        in: payPeriodIds,
                    },
                },
                include: {
                    payPeriod: true,
                },
                orderBy: {
                    payPeriod: {
                        endDate: 'asc',
                    },
                },
            });
            const labels = [];
            const data = [];
            journalData.forEach((journal) => {
                var _a;
                data.push(journal === null || journal === void 0 ? void 0 : journal.amount);
                labels.push((0, moment_1.default)((_a = journal === null || journal === void 0 ? void 0 : journal.payPeriod) === null || _a === void 0 ? void 0 : _a.endDate).format('MM/DD/YYYY'));
            });
            const number = Math.max(...data);
            const nearest1000 = Math.ceil(number / 1000) * 1000;
            const max = nearest1000 > number ? nearest1000 : nearest1000 + 1000;
            return { data, labels, max };
        });
    }
    getAllJournalsWithPayPeriod(companyId, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = year ? year : new Date().getFullYear();
            const startDateOfYear = new Date(`${Number(currentYear)}-01-01T00:00:00.000Z`);
            const endDateOfYear = new Date(`${Number(currentYear) + 1}-01-01T00:00:00.000Z`);
            const currentYearPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId,
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
            const payPeriodIds = currentYearPayPeriods.map((payPeriod) => {
                return payPeriod.id;
            });
            const journalData = yield prisma_1.prisma.journal.findMany({
                where: {
                    companyId,
                    payPeriodId: {
                        in: payPeriodIds,
                    },
                },
                include: {
                    payPeriod: true,
                },
                orderBy: {
                    payPeriod: {
                        endDate: 'desc',
                    },
                },
            });
            const graphData = [];
            if (journalData && journalData.length) {
                journalData.forEach((journal) => {
                    graphData.push({
                        payPeriodId: journal.payPeriodId,
                        payPeriodName: `${(0, moment_1.default)(journal.payPeriod.startDate).format('MM/DD/YYYY')} - ${(0, moment_1.default)(journal.payPeriod.endDate).format('MM/DD/YYYY')}`,
                        amount: journal.amount,
                    });
                });
            }
            return graphData;
        });
    }
    getEmployeeHoursGraphData(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyData = yield prisma_1.prisma.companyRole.findFirst({
                where: {
                    userId,
                    companyId
                }
            });
            if (!companyData) {
                throw new customError_1.CustomError(400, 'You are not allow to access this company data');
            }
            const query = `SELECT 
						ta."employeeId" as employeeId,
						e."fullName" as employeeName,
						(ROUND(sum(ta."minute"::numeric) / 60 + sum(ta."hours"::numeric), 2)) as totalHours
						FROM public."TimeActivities" ta 
						inner join public."Employee" e on ta."employeeId" = e."id"
						where ta."activityDate" < current_date and ta."companyId" = '${companyId}'
						group by ta."employeeId", e."fullName"
						order by e."fullName" asc`;
            const graphData = yield prisma_1.prisma.$queryRawUnsafe(query);
            const labels = [];
            const data = [];
            graphData.forEach((singleObj) => {
                labels.push(singleObj.employeename);
                data.push(singleObj.totalhours);
            });
            return { data, labels };
        });
    }
}
exports.default = new DashboardServices();
