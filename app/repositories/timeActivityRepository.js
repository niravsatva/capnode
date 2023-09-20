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
const customError_1 = require("../models/customError");
class TimeActivityRepository {
    getAllTimeActivities(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isOverHours = false;
                const { companyId, offset, limit, searchCondition, filterConditions, sortCondition, dateFilters, } = timeActivityData;
                if (isOverHours) {
                    const timeActivities = yield prisma_1.prisma.hoursOver.findMany({
                        where: {
                            companyId: companyId,
                            isOverHours: isOverHours,
                        },
                        include: {
                            employee: {
                                include: {
                                    timeActivities: {
                                        orderBy: {
                                            activityDate: 'desc',
                                        },
                                    },
                                },
                            },
                        },
                    });
                    return timeActivities;
                }
                const timeActivities = yield prisma_1.prisma.timeActivities.findMany(Object.assign({ where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, searchCondition), filterConditions), dateFilters), include: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                        SplitTimeActivities: {
                            select: {
                                id: true,
                                classId: true,
                                className: true,
                                customerId: true,
                                customerName: true,
                                hours: true,
                                minute: true,
                                activityDate: true,
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
    // Get time activity with over hours
    getAllTimeActivitiesOverHours(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, isOverHours, offset, limit, 
                // searchCondition,
                // filterConditions,
                // sortCondition,
                // dateFilters,
                search, sort, type, } = timeActivityData;
                let queryString = `
							SELECT 
								ta."id" as id, 
								ta."timeActivityId" as timeActivityId,
								ta."classId" as classId, 
								ta."className" as className, 
								ta."customerId" as customerId, 
								ta."customerName" as customerName, 
								ta."hours" as hours,
								ta."minute" as minutes,
								ta."companyId" as companyId,
								ta."employeeId" as employeeId,
								ta."activityDate" as activityDate,  
								e."fullName" as employeeName,
								json_agg(Distinct "ho") as overHours,
								json_agg(Distinct "sa") as splitActivities
								FROM "TimeActivities" ta
								LEFT JOIN "Employee" e ON ta."employeeId" = e."id"
								LEFT JOIN "SplitTimeActivities" sa ON sa."timeActivityId" = ta."id"
								LEFT JOIN "HoursOver"  ho ON e."id" = ho."employeeId" AND ho."year" = EXTRACT('Year' FROM ta."activityDate") 

								WHERE ta."companyId" = '${companyId}' AND ho."isOverHours"=true
							`;
                if (search) {
                    queryString += ` AND (ta."className"='${search}' OR ta."customerName"='${search}' OR e."fullName"='${search}')`;
                }
                let sortColumnName = `ta."activityDate"`;
                if (sort === 'className') {
                    sortColumnName = `ta."className"`;
                }
                if (sort === 'customerName') {
                    sortColumnName = `ta."customerName"`;
                }
                if (sort === 'employeeName') {
                    sortColumnName = `e."fullName"`;
                }
                queryString += `
								GROUP BY ta."id", e."fullName"
								ORDER BY ${sortColumnName} ${type ? type : 'desc'}
								OFFSET ${offset}
								LIMIT ${limit}`;
                if (isOverHours) {
                    const timeActivities = yield prisma_1.prisma.$queryRawUnsafe(queryString);
                    console.log('Time: ', timeActivities);
                    const finalData = timeActivities.map((singleActivity) => {
                        const data = {
                            id: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.id,
                            timeActivityId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.timeactivityid,
                            classId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.classid,
                            className: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.classname,
                            customerId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.customerid,
                            customerName: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.customername,
                            hours: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.hours,
                            minute: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.minutes,
                            companyId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.companyid,
                            employeeId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.employeeid,
                            activityDate: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.activitydate,
                            employeeName: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.employeename,
                            overhours: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.overhours,
                            employee: {
                                id: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.employeeid,
                                fullName: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.employeename,
                            },
                            SplitTimeActivities: (singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.splitactivities[0])
                                ? singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.splitactivities
                                : [],
                            isOver: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.overhours[0].isOverHours,
                            overHours: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.overhours[0].overHours,
                            overMinutes: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.overhours[0].overMinutes,
                            actualHours: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.hours,
                            actualMinutes: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.minutes,
                        };
                        return data;
                    });
                    return finalData;
                }
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    getTimeActivityDetails(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, parentActivityId } = timeActivityData;
                const timeActivity = yield prisma_1.prisma.timeActivities.findFirst({
                    where: {
                        id: parentActivityId,
                        companyId: companyId,
                    },
                    include: {
                        SplitTimeActivities: true,
                    },
                });
                return timeActivity;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getSingleTimeActivity(parentActivityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeActivity = yield prisma_1.prisma.timeActivities.findFirst({
                    where: {
                        id: parentActivityId,
                    },
                    include: {
                        SplitTimeActivities: true,
                    },
                });
                return timeActivity;
            }
            catch (err) {
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
                    const employee = yield prisma_1.prisma.employee.findFirst({
                        where: {
                            employeeId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId,
                            companyId: companyId,
                        },
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
                    const employee = yield prisma_1.prisma.employee.findFirst({
                        where: {
                            employeeId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId,
                            companyId: companyId,
                        },
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
                const { timeActivityId, companyId, hours, minute } = timeActivityData;
                const findActivity = yield prisma_1.prisma.timeActivities.findFirst({
                    where: {
                        id: timeActivityId,
                        companyId: companyId,
                    },
                });
                if (!findActivity) {
                    throw new customError_1.CustomError(404, 'Time Activity not found');
                }
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
    createTimeActivitySync(timeActivityData, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let employee = null;
                if (timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId) {
                    employee = yield prisma_1.prisma.employee.findFirst({
                        where: {
                            employeeId: timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.employeeId,
                            companyId: companyId,
                        },
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
                if (!(employee === null || employee === void 0 ? void 0 : employee.id)) {
                    delete data.employee;
                }
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
                if (!(employee === null || employee === void 0 ? void 0 : employee.id)) {
                    delete data.employee;
                }
                const createdTimeActivity = yield prisma_1.prisma.timeActivities.create({
                    data: data,
                    include: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                        SplitTimeActivities: true,
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
            const findActivity = yield prisma_1.prisma.timeActivities.findFirst({
                where: {
                    id: timeActivityId,
                    companyId: companyId,
                },
            });
            if (!findActivity) {
                throw new customError_1.CustomError(404, 'Time Activity not found');
            }
            const deleted = yield prisma_1.prisma.timeActivities.deleteMany({
                where: {
                    id: timeActivityId,
                    companyId: companyId,
                },
            });
            return deleted;
        });
    }
    // Get all time activities for export
    getAllTimeActivityForExport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, filterConditions, searchCondition, dateFilters } = data;
            try {
                const timeActivities = yield prisma_1.prisma.timeActivities.findMany({
                    where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, searchCondition), filterConditions), dateFilters),
                    include: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                    orderBy: {
                        activityDate: 'desc',
                    },
                });
                return timeActivities;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get employee hours
    getEmployeeHours(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, employeeId, year, fieldId } = data;
            try {
                const employeeCostFieldId = yield prisma_1.prisma.employeeCostField.findFirst({
                    where: {
                        companyId: companyId,
                        fieldId: fieldId,
                        employeeId: employeeId,
                    },
                });
                const employees = yield prisma_1.prisma.employeeCostValue.findFirst({
                    where: {
                        employeeId: employeeId,
                        year: year,
                        employeeFieldId: employeeCostFieldId === null || employeeCostFieldId === void 0 ? void 0 : employeeCostFieldId.id,
                        isPercentage: false,
                    },
                });
                return employees;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get employee-year wise time activity
    getTimeActivityByEmployee(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, employeeId, year } = data;
                const employee = yield prisma_1.prisma.timeActivities.findMany({
                    where: {
                        companyId: companyId,
                        employeeId: employeeId,
                        activityDate: {
                            gte: new Date(year, 0, 1),
                            lt: new Date(year + 1, 0, 1),
                        },
                    },
                });
                return employee;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get employee-time wise time activity
    getTimeActivityByEmployeeDate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, employeeId, startDate, endDate } = data;
                const employee = yield prisma_1.prisma.timeActivities.findMany({
                    where: {
                        companyId: companyId,
                        employeeId: employeeId,
                        activityDate: {
                            gte: startDate,
                            lt: endDate,
                        },
                    },
                    include: {
                        employee: true,
                    },
                });
                return employee;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new TimeActivityRepository();
