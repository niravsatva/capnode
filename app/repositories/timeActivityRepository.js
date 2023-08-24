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
class TimeActivityRepository {
    getAllTimeActivities(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, offset, limit, searchCondition, filterConditions, sortCondition, dateFilters, } = timeActivityData;
                const timeActivities = yield prisma_1.prisma.timeActivities.findMany(Object.assign({ where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, searchCondition), filterConditions), dateFilters), include: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    }, skip: offset, take: limit }, sortCondition));
                return timeActivities;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    getAllTimeActivitiesCount(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = timeActivityData;
                const timeActivitiesCount = yield prisma_1.prisma.timeActivities.count({
                    where: {
                        companyId: companyId,
                    },
                });
                return timeActivitiesCount;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    updateOrCreateTimeActivity(timeActivityId, companyId, timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeActivities = yield prisma_1.prisma.timeActivities.findFirst({
                    where: {
                        timeActivityId: timeActivityId,
                        companyId: companyId,
                    },
                });
                let updatedTimeActivities;
                if (timeActivities) {
                    const employee = yield prisma_1.prisma.employee.findUnique({
                        where: { employeeId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId },
                    });
                    const data = {
                        classId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.classId,
                        className: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.className,
                        customerId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerId,
                        customerName: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerName,
                        hours: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.hours,
                        minute: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.minute,
                        employeeId: employee === null || employee === void 0 ? void 0 : employee.id,
                        companyId: companyId,
                        // employee: { connect: { id: employee?.id } },
                        // company: { connect: { id: companyId } },
                        activityDate: new Date(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.activityDate),
                    };
                    if (!data.className) {
                        delete data.className;
                    }
                    if (!data.classId) {
                        delete data.classId;
                    }
                    const updated = yield prisma_1.prisma.timeActivities.updateMany({
                        where: {
                            timeActivityId: timeActivityId,
                            companyId: companyId,
                        },
                        data: data,
                    });
                    updatedTimeActivities = updated[0];
                }
                else {
                    console.log('INSIDE ELSE: ', timeActivityData);
                    const employee = yield prisma_1.prisma.employee.findUnique({
                        where: { employeeId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId },
                    });
                    const data = {
                        timeActivityId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.timeActivityId,
                        classId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.classId,
                        className: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.className,
                        customerId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerId,
                        customerName: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerName,
                        hours: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.hours,
                        minute: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.minute,
                        employee: { connect: { id: employee === null || employee === void 0 ? void 0 : employee.id } },
                        company: { connect: { id: companyId } },
                        activityDate: new Date(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.activityDate),
                    };
                    if (!data.classId) {
                        delete data.classId;
                    }
                    if (!data.className) {
                        delete data.className;
                    }
                    updatedTimeActivities = yield prisma_1.prisma.timeActivities.create({
                        data,
                    });
                }
                return updatedTimeActivities;
            }
            catch (err) {
                console.log('ERR:', err);
                throw err;
            }
        });
    }
    // Update Time activity hours
    updateTimeActivity(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeActivityId, hours, minute } = timeActivityData;
                const updatedTimeActivity = yield prisma_1.prisma.timeActivities.update({
                    where: {
                        id: timeActivityId,
                    },
                    data: {
                        hours: hours,
                        minute: minute,
                    },
                });
                return updatedTimeActivity;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Create a new time activity at first time sync
    createTimeActivitySync(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let employee = null;
                if (timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId) {
                    employee = yield prisma_1.prisma.employee.findUnique({
                        where: { employeeId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId },
                    });
                }
                const data = {
                    timeActivityId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.timeActivityId,
                    hours: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.hours,
                    minute: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.minute,
                    activityDate: new Date(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.activityDate),
                    company: { connect: { id: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.companyId } },
                    classId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.classId,
                    className: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.className,
                    customerId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerId,
                    customerName: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerName,
                    employee: { connect: { id: employee === null || employee === void 0 ? void 0 : employee.id } },
                };
                if (!(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.classId)) {
                    delete data.classId;
                    delete data.className;
                }
                if (!(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerId)) {
                    delete data.customerId;
                    delete data.customerName;
                }
                console.log(timeActivityData);
                if (!(employee === null || employee === void 0 ? void 0 : employee.id)) {
                    console.log(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId);
                    delete data.employee;
                }
                console.log('END');
                const createdTimeActivity = yield prisma_1.prisma.timeActivities.create({
                    data: data,
                    include: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                });
                return createdTimeActivity;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Create a new time activity
    createTimeActivity(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let employee = null;
                if (timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId) {
                    employee = yield prisma_1.prisma.employee.findUnique({
                        where: { id: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId },
                    });
                }
                const data = {
                    timeActivityId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.timeActivityId,
                    hours: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.hours,
                    minute: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.minute,
                    activityDate: new Date(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.activityDate),
                    company: { connect: { id: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.companyId } },
                    classId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.classId,
                    className: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.className,
                    customerId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerId,
                    customerName: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerName,
                    employee: { connect: { id: employee === null || employee === void 0 ? void 0 : employee.id } },
                };
                if (!(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.classId)) {
                    delete data.classId;
                    delete data.className;
                }
                if (!(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.customerId)) {
                    delete data.customerId;
                    delete data.customerName;
                }
                console.log(timeActivityData);
                if (!(employee === null || employee === void 0 ? void 0 : employee.id)) {
                    console.log(timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId);
                    delete data.employee;
                }
                console.log('END');
                const createdTimeActivity = yield prisma_1.prisma.timeActivities.create({
                    data: data,
                    include: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                });
                return createdTimeActivity;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Delete a time activity
    deleteTimeActivity(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { timeActivityId, companyId } = timeActivityData;
            const deleted = yield prisma_1.prisma.timeActivities.deleteMany({
                where: {
                    id: timeActivityId,
                    companyId: companyId,
                },
            });
            return deleted;
        });
    }
}
exports.default = new TimeActivityRepository();
