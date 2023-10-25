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
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../client/prisma");
class TimeSheetRepository {
    // Get all time sheets
    getAllTimeSheets(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, offset, limit, searchCondition, filterConditions, sortCondition, payPeriodFilter, } = timeSheetData;
            const timeSheets = yield prisma_1.prisma.timeSheets.findMany(Object.assign(Object.assign({ where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, payPeriodFilter), searchCondition), filterConditions), skip: offset, take: limit }, sortCondition), { include: {
                    timeActivities: true,
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                } }));
            const count = yield prisma_1.prisma.timeSheets.count();
            return { timeSheets, count };
        });
    }
    // Get time sheet details
    getTimeSheetDetails(timeSheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheetDetails = yield prisma_1.prisma.timeSheets.findFirst({
                where: {
                    id: timeSheetId,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    timeActivities: true,
                },
            });
            return timeSheetDetails;
        });
    }
    // Create new time sheet
    createTimeSheet(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, notes, status = 'Draft', companyId, userId, payPeriodId, timeActivities, findExistingTimeSheet, } = timeSheetData;
            // const findExistingTimeSheet = await prisma.timeSheets.findUnique({
            // 	where: {
            // 		payPeriodId,
            // 	},
            // });
            if (findExistingTimeSheet) {
                yield prisma_1.prisma.timeSheets.update({
                    where: {
                        id: findExistingTimeSheet.id,
                    },
                    data: {
                        timeActivities: {
                            disconnect: findExistingTimeSheet === null || findExistingTimeSheet === void 0 ? void 0 : findExistingTimeSheet.timeActivities.map((timeActivityId) => ({
                                id: timeActivityId.id,
                            })),
                        },
                    },
                });
                const timeSheet = yield prisma_1.prisma.timeSheets.update({
                    where: {
                        id: findExistingTimeSheet.id,
                    },
                    data: {
                        name: name,
                        notes: notes,
                        status: status,
                        company: { connect: { id: companyId } },
                        createdBy: { connect: { id: userId } },
                        payPeriod: { connect: { id: payPeriodId } },
                        timeActivities: {
                            connect: timeActivities.map((timeActivityId) => ({
                                id: timeActivityId.id,
                            })),
                        },
                        submittedOn: new Date(),
                    },
                });
                return timeSheet;
            }
            const timeSheet = yield prisma_1.prisma.timeSheets.create({
                data: {
                    name: name,
                    notes: notes,
                    status: status,
                    company: { connect: { id: companyId } },
                    createdBy: { connect: { id: userId } },
                    payPeriod: { connect: { id: payPeriodId } },
                    timeActivities: {
                        connect: timeActivities.map((timeActivityId) => ({
                            id: timeActivityId.id,
                        })),
                    },
                    submittedOn: new Date(),
                },
            });
            return timeSheet;
        });
    }
    // Create new time sheet employee logs
    createTimeSheetLogs(timeSheetLogsData) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheetLogs = yield Promise.all(yield (timeSheetLogsData === null || timeSheetLogsData === void 0 ? void 0 : timeSheetLogsData.map((singleTimeSheetLog) => __awaiter(this, void 0, void 0, function* () {
                yield prisma_1.prisma.timeSheetLogs.create({
                    data: {
                        hours: singleTimeSheetLog === null || singleTimeSheetLog === void 0 ? void 0 : singleTimeSheetLog.hours,
                        minute: singleTimeSheetLog === null || singleTimeSheetLog === void 0 ? void 0 : singleTimeSheetLog.minute,
                        timeSheets: { connect: { id: singleTimeSheetLog === null || singleTimeSheetLog === void 0 ? void 0 : singleTimeSheetLog.timeSheetsId } },
                        employee: { connect: { id: singleTimeSheetLog === null || singleTimeSheetLog === void 0 ? void 0 : singleTimeSheetLog.employeeId } },
                    },
                });
            }))));
            return timeSheetLogs;
        });
    }
    // Get Employees
    getEmployees(timeSheetId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheet = yield prisma_1.prisma.timeSheets.findFirst({
                where: {
                    id: timeSheetId,
                    companyId: companyId,
                },
                include: {
                    timeActivities: {
                        include: {
                            employee: true,
                        },
                    },
                },
            });
            return timeSheet;
        });
    }
    // Get timesheet by payperiod
    getTimeSheetByPayPeriod(payperiodId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheet = yield prisma_1.prisma.timeSheets.findUnique({
                where: {
                    payPeriodId: payperiodId,
                },
            });
            return timeSheet;
        });
    }
}
exports.default = new TimeSheetRepository();
