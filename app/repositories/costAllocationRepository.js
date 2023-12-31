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
const uuid_1 = require("uuid");
class costAllocationRepository {
    // Get all time sheets
    hoursToMin(hrs, min) {
        const hours = hrs;
        const minutes = min;
        return Number(hours * 60 + minutes);
    }
    allocationPercentage(currMin, totalMin) {
        const percentage = (Number(currMin) / Number(totalMin)) * 100;
        return percentage;
    }
    totalHoursIntoMin(arr) {
        let totalMinutes = 0;
        arr.forEach((entry) => __awaiter(this, void 0, void 0, function* () {
            const hours = parseInt(entry.hours);
            const minutes = parseInt(entry.minute);
            const min = this.hoursToMin(hours, minutes);
            totalMinutes += Number(min);
        }));
        return totalMinutes;
    }
    minToHours(totalMinutes) {
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        return `${totalHours.toString().padStart(2, '0')}:${remainingMinutes
            .toString()
            .padStart(2, '0')}`;
    }
    getCostAllocation(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, offset, limit, searchCondition, empFilterConditions, filterConditions, sortCondition, payPeriodId, timeSheetId, } = costAllocationData;
            const query = Object.assign({ where: Object.assign(Object.assign({ companyId: companyId, active: true }, empFilterConditions), { timeActivities: {
                        some: Object.assign(Object.assign({ timeSheetId: timeSheetId }, filterConditions), searchCondition),
                    } }), select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: Object.assign(Object.assign({ timeSheetId: timeSheetId }, filterConditions), searchCondition),
                        include: {
                            SplitTimeActivities: true
                        }
                    },
                    employeeCostField: {
                        where: {
                            field: {
                                payPeriodId,
                                isActive: true
                            },
                            payPeriodId
                        },
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId: payPeriodId,
                                    isPercentage: true,
                                },
                            },
                        },
                    },
                }, skip: offset, take: limit }, sortCondition);
            if (!offset) {
                delete query['skip'];
            }
            if (!limit) {
                delete query['take'];
            }
            const _costAllocations = yield prisma_1.prisma.employee.findMany(query);
            //NOTE: If filter and other things not work remove this split activity additional logic
            const splitSearchCondition = searchCondition && searchCondition.OR ? {
                OR: [
                    searchCondition.OR[2]
                ]
            } : {};
            const splitQuery = Object.assign({ where: Object.assign(Object.assign({ companyId: companyId }, empFilterConditions), { timeActivities: {
                        some: Object.assign(Object.assign({ timeSheetId: timeSheetId }, splitSearchCondition), { SplitTimeActivities: {
                                some: Object.assign({}, filterConditions)
                            } }),
                    } }), select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: Object.assign(Object.assign({ timeSheetId: timeSheetId }, splitSearchCondition), { SplitTimeActivities: {
                                some: Object.assign({}, filterConditions)
                            } }),
                        include: {
                            SplitTimeActivities: {
                                where: Object.assign({}, filterConditions)
                            }
                        }
                    },
                    employeeCostField: {
                        where: {
                            field: {
                                payPeriodId,
                                isActive: true
                            },
                            payPeriodId
                        },
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId: payPeriodId,
                                    isPercentage: true,
                                },
                            },
                        },
                    },
                }, skip: offset, take: limit }, sortCondition);
            if (!offset) {
                delete splitQuery['skip'];
            }
            if (!limit) {
                delete splitQuery['take'];
            }
            const splitActivities = yield prisma_1.prisma.employee.findMany(splitQuery);
            const notFoundEmployeeData = [];
            splitActivities.forEach((e) => {
                const costAllocation = _costAllocations.find((x) => x.id === e.id);
                if (!costAllocation) {
                    notFoundEmployeeData.push(e);
                }
            });
            const costAllocations = [..._costAllocations, ...notFoundEmployeeData];
            let response = [];
            const companySection = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId,
                    no: {
                        gt: 0,
                    },
                    payPeriodId
                },
            });
            const sectionIds = companySection.map((e) => {
                return e.id;
            });
            const companyFields = yield prisma_1.prisma.field.findMany({
                where: {
                    companyId,
                    jsonId: 't1',
                    configurationSectionId: {
                        in: sectionIds,
                    },
                    payPeriodId
                },
            });
            const totalFields = companyFields.map((e) => {
                return e.id;
            });
            const employeeRowSpanMapping = {
                Total: 1,
                'Grand Total': 1
            };
            const salarySection = companySection.find((e) => e.no === 1);
            const salarySectionFields = companyFields
                .filter((e) => e.configurationSectionId === (salarySection === null || salarySection === void 0 ? void 0 : salarySection.id))
                .map((e) => {
                return e.id;
            });
            const companyConfiguration = yield prisma_1.prisma.configuration.findFirst({
                where: {
                    companyId,
                    payPeriodId
                },
            });
            let percentageToFixed = 4;
            if (companyConfiguration && companyConfiguration.decimalToFixedPercentage) {
                percentageToFixed = companyConfiguration.decimalToFixedPercentage;
            }
            let grandTotal = 0;
            for (const singleCostAllocation of costAllocations) {
                const costAllocation = singleCostAllocation;
                const allTimeActivities = yield prisma_1.prisma.timeActivities.findMany({
                    where: {
                        timeSheetId,
                        employeeId: costAllocation.id,
                    },
                });
                const totalTimeMin = this.totalHoursIntoMin(allTimeActivities);
                const employeeCostMappingData = [];
                if (costAllocation.employeeCostField.length) {
                    costAllocation.employeeCostField.forEach((singleEmployeeData) => {
                        const obj = {};
                        if (singleEmployeeData) {
                            if (singleEmployeeData &&
                                singleEmployeeData.field &&
                                sectionIds.includes(singleEmployeeData.field.configurationSectionId)) {
                                obj[singleEmployeeData.field.id] =
                                    singleEmployeeData.costValue[0].value;
                                employeeCostMappingData.push(obj);
                            }
                        }
                    });
                }
                const timeActivity = [];
                // const totalTime = this.minToHours(totalTimeMin);
                const allTotalColumnsObj = {};
                let totalAllocationPercentage = 0;
                let availableTotalMinutes = 0;
                //Array with time activities with same customer and class
                const sameCustomerWithSameClass = [];
                costAllocation === null || costAllocation === void 0 ? void 0 : costAllocation.timeActivities.forEach((timeActivities) => {
                    if (!timeActivities.SplitTimeActivities.length) {
                        const findSameTimeLog = sameCustomerWithSameClass.find((e) => e.customerName === timeActivities.customerName &&
                            e.className === timeActivities.className);
                        if (findSameTimeLog) {
                            findSameTimeLog.hours =
                                parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                            findSameTimeLog.minute =
                                parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute) +
                                    parseInt(findSameTimeLog.minute);
                        }
                        else {
                            sameCustomerWithSameClass.push(timeActivities);
                        }
                    }
                });
                const splitTimeActivities = splitActivities.find((e) => e.id === costAllocation.id);
                if (splitTimeActivities && ((_a = splitTimeActivities === null || splitTimeActivities === void 0 ? void 0 : splitTimeActivities.timeActivities) === null || _a === void 0 ? void 0 : _a.length)) {
                    splitTimeActivities === null || splitTimeActivities === void 0 ? void 0 : splitTimeActivities.timeActivities.forEach((timeActivities) => {
                        if (timeActivities.SplitTimeActivities.length) {
                            timeActivities.SplitTimeActivities.forEach((splitActivity) => {
                                const findSameTimeLog = sameCustomerWithSameClass.find((e) => e.customerName === splitActivity.customerName &&
                                    e.className === splitActivity.className);
                                if (findSameTimeLog) {
                                    findSameTimeLog.hours =
                                        parseInt(splitActivity === null || splitActivity === void 0 ? void 0 : splitActivity.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                                    findSameTimeLog.minute =
                                        parseInt(splitActivity === null || splitActivity === void 0 ? void 0 : splitActivity.minute) +
                                            parseInt(findSameTimeLog.minute);
                                }
                                else {
                                    sameCustomerWithSameClass.push(splitActivity);
                                }
                            });
                        }
                    });
                }
                employeeRowSpanMapping[costAllocation.fullName] =
                    sameCustomerWithSameClass.length;
                sameCustomerWithSameClass.forEach((timeActivities, timeActivityIndex) => {
                    const costAllocationObj = {
                        id: (0, uuid_1.v4)(),
                    };
                    const hours = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours);
                    const minutes = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute);
                    const currActivitiesTime = this.hoursToMin(hours, minutes);
                    availableTotalMinutes = availableTotalMinutes + currActivitiesTime;
                    let allocation = this.allocationPercentage(Number(currActivitiesTime), Number(totalTimeMin));
                    if (!hours && !minutes) {
                        allocation = 0;
                    }
                    totalAllocationPercentage =
                        totalAllocationPercentage + Number(allocation);
                    if (timeActivityIndex === 0) {
                        costAllocationObj['employee-name'] = costAllocation.fullName;
                    }
                    costAllocationObj['total-hours'] = this.minToHours(currActivitiesTime);
                    costAllocationObj['customer-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerName;
                    costAllocationObj['class-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.className;
                    costAllocationObj['allocation'] = `${allocation.toFixed(percentageToFixed)}%`;
                    employeeCostMappingData.forEach((data) => {
                        const key = Object.keys(data)[0];
                        const value = (Number(allocation) * Number(data[key])) / 100;
                        if (totalFields.includes(key)) {
                            grandTotal = grandTotal + value;
                        }
                        if (allTotalColumnsObj[key]) {
                            allTotalColumnsObj[key] = allTotalColumnsObj[key] + value;
                        }
                        else {
                            allTotalColumnsObj[key] = value;
                        }
                        // if (totalFields.includes(key)) {
                        // }
                        if (salarySectionFields.includes(key)) {
                            const directAllocation = (value * Number(companyConfiguration === null || companyConfiguration === void 0 ? void 0 : companyConfiguration.indirectExpenseRate)) /
                                100;
                            costAllocationObj['indirect-allocation'] = directAllocation;
                            grandTotal = grandTotal + directAllocation;
                            if (allTotalColumnsObj['indirect-allocation']) {
                                allTotalColumnsObj['indirect-allocation'] =
                                    allTotalColumnsObj['indirect-allocation'] + directAllocation;
                            }
                            else {
                                allTotalColumnsObj['indirect-allocation'] = directAllocation;
                            }
                        }
                        costAllocationObj[key] = value;
                    });
                    timeActivity.push(costAllocationObj);
                    if (sameCustomerWithSameClass.length - 1 === timeActivityIndex) {
                        const timeActivitiesTotalColumn = Object.assign(Object.assign({}, allTotalColumnsObj), { id: (0, uuid_1.v4)(), type: 'total', allocation: `${totalAllocationPercentage.toFixed(percentageToFixed)}%`, 'total-hours': this.minToHours(availableTotalMinutes), 'employee-name': 'Total', 'totalHoursInMinutes': availableTotalMinutes, 'totalRowEmployeeName': costAllocation.fullName });
                        timeActivity.push(timeActivitiesTotalColumn);
                    }
                });
                response = [...response, ...timeActivity];
            }
            const count = yield prisma_1.prisma.employee.count({
                where: query.where,
            });
            return { result: response, employeeRowSpanMapping, count, grandTotal };
        });
    }
    getGrandTotalRowCostAllocation(response) {
        if (!response || !response.length) {
            return null;
        }
        const notIncludeFields = ['employee-name', 'allocation', 'customer-name', 'class-name', 'totalRowEmployeeName'];
        const totalMapping = {};
        response.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (!notIncludeFields.includes(key)) {
                    if (totalMapping[key]) {
                        totalMapping[key] = row[key] + totalMapping[key];
                    }
                    else {
                        totalMapping[key] = row[key];
                    }
                }
            });
        });
        totalMapping['total-hours'] = this.minToHours(totalMapping['totalHoursInMinutes']);
        totalMapping['employee-name'] = 'Grand Total';
        totalMapping['type'] = 'grandTotal';
        return totalMapping;
    }
    getRowWiseTotal(row, includeFields) {
        if (!row || !Object.keys(row).length) {
            return null;
        }
        let total = 0;
        Object.keys(row).forEach((key) => {
            if (includeFields.includes(key)) {
                total = row[key] + total;
            }
        });
        return total;
    }
    getCostAllocationForJournal(costAllocationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId, timeSheetId } = costAllocationData;
            const query = {
                where: {
                    companyId: companyId,
                    active: true,
                    timeActivities: {
                        some: {
                            timeSheetId: timeSheetId,
                        },
                    },
                },
                select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: {
                            timeSheetId: timeSheetId,
                        },
                        include: {
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
                                    isAutoSplit: true,
                                    isClassReadOnly: true,
                                    isCustomerReadOnly: true,
                                    customRuleId: true
                                }
                            }
                        }
                    },
                    employeeCostField: {
                        where: {
                            field: {
                                payPeriodId,
                                isActive: true
                            },
                            payPeriodId
                        },
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId: payPeriodId,
                                    isPercentage: true,
                                },
                            },
                        },
                    },
                },
            };
            const costAllocations = yield prisma_1.prisma.employee.findMany(Object.assign(Object.assign({}, query), { orderBy: {
                    fullName: 'asc',
                } }));
            const response = [];
            const companySection = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId,
                    no: {
                        gt: 0,
                    },
                    payPeriodId
                },
            });
            const sectionIds = companySection.map((e) => {
                return e.id;
            });
            const companyFields = yield prisma_1.prisma.field.findMany({
                where: {
                    companyId,
                    jsonId: 't1',
                    configurationSectionId: {
                        in: sectionIds,
                    },
                    payPeriodId
                },
            });
            const salarySection = companySection.find((e) => e.no === 1);
            const salarySectionFields = companyFields
                .filter((e) => e.configurationSectionId === (salarySection === null || salarySection === void 0 ? void 0 : salarySection.id))
                .map((e) => {
                return e.id;
            });
            const companyConfiguration = yield prisma_1.prisma.configuration.findFirst({
                where: {
                    companyId,
                    payPeriodId
                },
            });
            for (const singleCostAllocation of costAllocations) {
                const costAllocation = singleCostAllocation;
                const allTimeActivities = yield prisma_1.prisma.timeActivities.findMany({
                    where: {
                        timeSheetId,
                        employeeId: costAllocation.id,
                    },
                });
                const totalTimeMin = this.totalHoursIntoMin(allTimeActivities);
                const employeeCostMappingData = [];
                if (costAllocation.employeeCostField.length) {
                    costAllocation.employeeCostField.forEach((singleEmployeeData) => {
                        const obj = {};
                        if (singleEmployeeData) {
                            if (singleEmployeeData &&
                                singleEmployeeData.field &&
                                sectionIds.includes(singleEmployeeData.field.configurationSectionId)) {
                                obj[singleEmployeeData.field.id] =
                                    singleEmployeeData.costValue[0].value;
                                employeeCostMappingData.push(obj);
                            }
                        }
                    });
                }
                const timeActivity = [];
                let totalAllocationPercentage = 0;
                let availableTotalMinutes = 0;
                //Array with time activities with same customer and class
                const sameCustomerWithSameClass = [];
                costAllocation === null || costAllocation === void 0 ? void 0 : costAllocation.timeActivities.forEach((timeActivities) => {
                    const findSameTimeLog = sameCustomerWithSameClass.find((e) => e.customerName === timeActivities.customerName &&
                        e.className === timeActivities.className);
                    if (!timeActivities.SplitTimeActivities.length) {
                        if (findSameTimeLog) {
                            findSameTimeLog.hours =
                                parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                            findSameTimeLog.minute =
                                parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute) +
                                    parseInt(findSameTimeLog.minute);
                        }
                        else {
                            sameCustomerWithSameClass.push(timeActivities);
                        }
                    }
                    else {
                        timeActivities.SplitTimeActivities.forEach((splitActivity) => {
                            const findSameTimeLog = sameCustomerWithSameClass.find((e) => e.customerName === splitActivity.customerName &&
                                e.className === splitActivity.className);
                            if (findSameTimeLog) {
                                findSameTimeLog.hours =
                                    parseInt(splitActivity === null || splitActivity === void 0 ? void 0 : splitActivity.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                                findSameTimeLog.minute =
                                    parseInt(splitActivity === null || splitActivity === void 0 ? void 0 : splitActivity.minute) +
                                        parseInt(findSameTimeLog.minute);
                            }
                            else {
                                sameCustomerWithSameClass.push(splitActivity);
                            }
                        });
                    }
                });
                sameCustomerWithSameClass.forEach((timeActivities) => {
                    const costAllocationObj = {
                        id: (0, uuid_1.v4)(),
                    };
                    const hours = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours);
                    const minutes = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute);
                    const currActivitiesTime = this.hoursToMin(hours, minutes);
                    availableTotalMinutes = availableTotalMinutes + currActivitiesTime;
                    let allocation = this.allocationPercentage(Number(currActivitiesTime), Number(totalTimeMin));
                    if (!hours && !minutes) {
                        allocation = 0;
                    }
                    totalAllocationPercentage =
                        totalAllocationPercentage + Number(allocation);
                    costAllocationObj['employee-name'] = costAllocation.fullName;
                    costAllocationObj['customer-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerName;
                    costAllocationObj['customerId'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerId;
                    costAllocationObj['class-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.className;
                    costAllocationObj['classId'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.classId;
                    employeeCostMappingData.forEach((data) => {
                        const key = Object.keys(data)[0];
                        const value = (Number(allocation) * Number(data[key])) / 100;
                        if (salarySectionFields.includes(key)) {
                            const directAllocation = (value * Number(companyConfiguration === null || companyConfiguration === void 0 ? void 0 : companyConfiguration.indirectExpenseRate)) / 100;
                            costAllocationObj['indirect-allocation'] = directAllocation;
                        }
                        costAllocationObj[key] = value;
                    });
                    timeActivity.push(costAllocationObj);
                });
                response.push({
                    costAllocation: timeActivity,
                });
            }
            return response;
        });
    }
    getExpensesByCustomer(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId, timeSheetId, searchCondition } = costAllocationData;
            const _costAllocations = yield prisma_1.prisma.employee.findMany({
                where: {
                    companyId: companyId,
                    active: true,
                    timeActivities: {
                        some: Object.assign({ timeSheetId }, searchCondition),
                    },
                },
                select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: Object.assign({ timeSheetId }, searchCondition),
                        include: {
                            SplitTimeActivities: true
                        }
                    },
                    employeeCostField: {
                        where: {
                            field: {
                                payPeriodId,
                                isActive: true
                            },
                            payPeriodId
                        },
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId,
                                    isPercentage: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    fullName: 'asc',
                },
            });
            //NOTE: If filter and other things not work remove this split activity additional logic
            const splitQuery = {
                where: {
                    companyId: companyId,
                    timeActivities: {
                        some: {
                            timeSheetId: timeSheetId,
                            SplitTimeActivities: {
                                some: Object.assign({}, searchCondition)
                            }
                        },
                    },
                },
                select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: {
                            timeSheetId: timeSheetId,
                            SplitTimeActivities: {
                                some: Object.assign({}, searchCondition)
                            }
                        },
                        include: {
                            SplitTimeActivities: {
                                where: Object.assign({}, searchCondition)
                            }
                        }
                    },
                    employeeCostField: {
                        where: {
                            field: {
                                payPeriodId,
                                isActive: true
                            },
                            payPeriodId
                        },
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId: payPeriodId,
                                    isPercentage: true,
                                },
                            },
                        },
                    },
                }
            };
            const splitActivities = yield prisma_1.prisma.employee.findMany(splitQuery);
            const notFoundEmployeeData = [];
            splitActivities.forEach((e) => {
                const costAllocation = _costAllocations.find((x) => x.id === e.id);
                if (!costAllocation) {
                    notFoundEmployeeData.push(e);
                }
            });
            const costAllocations = [..._costAllocations, ...notFoundEmployeeData];
            const companySection = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId,
                    no: {
                        gt: 0,
                    },
                    payPeriodId
                },
            });
            const sectionIds = companySection.map((e) => {
                return e.id;
            });
            const companyFields = yield prisma_1.prisma.field.findMany({
                where: {
                    companyId,
                    jsonId: 't1',
                    configurationSectionId: {
                        in: sectionIds,
                    },
                    payPeriodId
                },
            });
            const salarySection = companySection.find((e) => e.no === 1);
            const salarySectionFields = companyFields
                .filter((e) => e.configurationSectionId === (salarySection === null || salarySection === void 0 ? void 0 : salarySection.id))
                .map((e) => {
                return e.id;
            });
            const totalFields = companyFields.map((e) => {
                return e.id;
            });
            const companyConfiguration = yield prisma_1.prisma.configuration.findFirst({
                where: {
                    companyId,
                    payPeriodId
                },
            });
            const customerTotalMapping = [];
            for (const singleCostAllocation of costAllocations) {
                const costAllocation = singleCostAllocation;
                const allTimeActivities = yield prisma_1.prisma.timeActivities.findMany({
                    where: {
                        timeSheetId,
                        employeeId: costAllocation.id,
                    },
                });
                const totalTimeMin = this.totalHoursIntoMin(allTimeActivities);
                const employeeCostMappingData = [];
                if (costAllocation.employeeCostField.length) {
                    costAllocation.employeeCostField.forEach((singleEmployeeData) => {
                        const obj = {};
                        if (singleEmployeeData) {
                            if (singleEmployeeData &&
                                singleEmployeeData.field &&
                                sectionIds.includes(singleEmployeeData.field.configurationSectionId)) {
                                let value = 0;
                                singleEmployeeData.costValue.forEach((e) => {
                                    value = value + Number(e.value);
                                });
                                obj[singleEmployeeData.field.id] = value;
                                employeeCostMappingData.push(obj);
                            }
                        }
                    });
                }
                // const totalTime = this.minToHours(totalTimeMin);
                let totalAllocationPercentage = 0;
                let availableTotalMinutes = 0;
                //Array with time activities with same customer and class
                const sameCustomer = [];
                costAllocation === null || costAllocation === void 0 ? void 0 : costAllocation.timeActivities.forEach((timeActivities) => {
                    if (!timeActivities.SplitTimeActivities.length) {
                        const findSameTimeLog = sameCustomer.find((e) => e.customerName === timeActivities.customerName &&
                            e.className === timeActivities.className);
                        if (findSameTimeLog) {
                            findSameTimeLog.hours =
                                parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                            findSameTimeLog.minute =
                                parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute) +
                                    parseInt(findSameTimeLog.minute);
                        }
                        else {
                            sameCustomer.push(timeActivities);
                        }
                    }
                });
                const splitTimeActivities = splitActivities.find((e) => e.id === costAllocation.id);
                if (splitTimeActivities && ((_a = splitTimeActivities === null || splitTimeActivities === void 0 ? void 0 : splitTimeActivities.timeActivities) === null || _a === void 0 ? void 0 : _a.length)) {
                    splitTimeActivities === null || splitTimeActivities === void 0 ? void 0 : splitTimeActivities.timeActivities.forEach((timeActivities) => {
                        if (timeActivities.SplitTimeActivities.length) {
                            timeActivities.SplitTimeActivities.forEach((splitActivity) => {
                                const findSameTimeLog = sameCustomer.find((e) => e.customerName === splitActivity.customerName &&
                                    e.className === splitActivity.className);
                                if (findSameTimeLog) {
                                    findSameTimeLog.hours =
                                        parseInt(splitActivity === null || splitActivity === void 0 ? void 0 : splitActivity.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                                    findSameTimeLog.minute =
                                        parseInt(splitActivity === null || splitActivity === void 0 ? void 0 : splitActivity.minute) +
                                            parseInt(findSameTimeLog.minute);
                                }
                                else {
                                    sameCustomer.push(splitActivity);
                                }
                            });
                        }
                    });
                }
                costAllocation.employeeCostMappingData = employeeCostMappingData;
                sameCustomer.forEach((timeActivities) => {
                    const hours = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours);
                    const minutes = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute);
                    const currActivitiesTime = this.hoursToMin(hours, minutes);
                    availableTotalMinutes = availableTotalMinutes + currActivitiesTime;
                    let allocation = this.allocationPercentage(Number(currActivitiesTime), Number(totalTimeMin));
                    if (!hours && !minutes) {
                        allocation = 0;
                    }
                    totalAllocationPercentage =
                        totalAllocationPercentage + Number(allocation);
                    let totalOfAllSalary = 0;
                    employeeCostMappingData.forEach((data) => {
                        const key = Object.keys(data)[0];
                        const value = (Number(allocation) * Number(data[key])) / 100;
                        if (totalFields.includes(key)) {
                            totalOfAllSalary = totalOfAllSalary + value;
                        }
                        if (salarySectionFields.includes(key)) {
                            const directAllocation = (value * Number(companyConfiguration === null || companyConfiguration === void 0 ? void 0 : companyConfiguration.indirectExpenseRate)) /
                                100;
                            totalOfAllSalary = totalOfAllSalary + directAllocation;
                        }
                    });
                    customerTotalMapping.push({
                        name: timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerName,
                        value: totalOfAllSalary,
                        id: timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerId,
                    });
                });
            }
            return customerTotalMapping;
        });
    }
}
exports.default = new costAllocationRepository();
