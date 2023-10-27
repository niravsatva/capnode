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
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, offset, limit, searchCondition, empFilterConditions, filterConditions, sortCondition, payPeriodId, timeSheetId, } = costAllocationData;
            const query = Object.assign({ where: Object.assign(Object.assign({ companyId: companyId }, empFilterConditions), { timeActivities: {
                        some: Object.assign(Object.assign({ timeSheetId: timeSheetId }, filterConditions), searchCondition),
                    } }), select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: Object.assign(Object.assign({ timeSheetId: timeSheetId }, filterConditions), searchCondition),
                    },
                    employeeCostField: {
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
            const costAllocations = yield prisma_1.prisma.employee.findMany(query);
            let response = [];
            const companySection = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId,
                    no: {
                        gt: 0,
                    },
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
                },
            });
            const totalFields = companyFields.map((e) => {
                return e.id;
            });
            const employeeRowSpanMapping = {
                '': 1,
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
                // const totalTime = this.minToHours(totalTimeMin);
                const allTotalColumnsObj = {};
                let totalAllocationPercentage = 0;
                let availableTotalMinutes = 0;
                //Array with time activities with same customer and class
                const sameCustomerWithSameClass = [];
                costAllocation === null || costAllocation === void 0 ? void 0 : costAllocation.timeActivities.forEach((timeActivities) => {
                    const findSameTimeLog = sameCustomerWithSameClass.find((e) => e.customerName === timeActivities.customerName && e.className === timeActivities.className);
                    if (findSameTimeLog) {
                        findSameTimeLog.hours = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours) + parseInt(findSameTimeLog === null || findSameTimeLog === void 0 ? void 0 : findSameTimeLog.hours);
                        findSameTimeLog.minutes = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute) + parseInt(findSameTimeLog.minutes);
                    }
                    else {
                        sameCustomerWithSameClass.push(timeActivities);
                    }
                });
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
                    costAllocationObj['total-hours'] = `${timeActivities.hours}:${timeActivities.minute}`;
                    costAllocationObj['customer-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerName;
                    costAllocationObj['class-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.className;
                    costAllocationObj['allocation'] = `${allocation.toFixed(4)}%`;
                    employeeCostMappingData.forEach((data) => {
                        const key = Object.keys(data)[0];
                        const value = (Number(allocation) * Number(data[key])) / 100;
                        if (totalFields.includes(key)) {
                            if (allTotalColumnsObj[key]) {
                                allTotalColumnsObj[key] = allTotalColumnsObj[key] + value;
                            }
                            else {
                                allTotalColumnsObj[key] = value;
                            }
                        }
                        if (salarySectionFields.includes(key)) {
                            const directAllocation = (value * Number(companyConfiguration === null || companyConfiguration === void 0 ? void 0 : companyConfiguration.indirectExpenseRate)) /
                                100;
                            costAllocationObj['indirect-allocation'] = directAllocation;
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
                        const timeActivitiesTotalColumn = Object.assign(Object.assign({}, allTotalColumnsObj), { id: (0, uuid_1.v4)(), type: 'total', allocation: `${totalAllocationPercentage.toFixed(2)}%`, 'total-hours': this.minToHours(availableTotalMinutes), 'employee-name': '' });
                        timeActivity.push(timeActivitiesTotalColumn);
                    }
                });
                response = [...response, ...timeActivity];
            }
            const count = yield prisma_1.prisma.employee.count({
                where: query.where,
            });
            return { result: response, employeeRowSpanMapping, count };
        });
    }
}
exports.default = new costAllocationRepository();
