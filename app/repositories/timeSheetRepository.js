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
            const { companyId, offset, limit, searchCondition, filterConditions, sortCondition, dateFilters, } = timeSheetData;
            const timeSheets = yield prisma_1.prisma.timeSheets.findMany(Object.assign(Object.assign({ where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, searchCondition), dateFilters), filterConditions), skip: offset, take: limit }, sortCondition), { include: {
                    TimeSheetLogs: {
                        select: {
                            id: true,
                            hours: true,
                            minute: true,
                            employeeId: true,
                            timeSheetsId: true,
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                } }));
            return timeSheets;
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
                    TimeSheetLogs: {
                        include: {
                            employee: {
                                select: {
                                    id: true,
                                    email: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                },
            });
            return timeSheetDetails;
        });
    }
    // Create new time sheet
    createTimeSheet(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, totalHours, totalMinute, notes, status, companyId, userId, SubmittedOn, } = timeSheetData;
            const timeSheet = yield prisma_1.prisma.timeSheets.create({
                data: {
                    name: name,
                    totalHours: totalHours,
                    totalMinute: totalMinute,
                    notes: notes,
                    status: status,
                    company: { connect: { id: companyId } },
                    createdBy: { connect: { id: userId } },
                    SubmitedOn: SubmittedOn,
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
}
exports.default = new TimeSheetRepository();
