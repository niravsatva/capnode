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
        return percentage.toFixed(2);
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
    minTohours(totalMinutes) {
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        return `${totalHours.toString().padStart(2, '0')}:${remainingMinutes
            .toString()
            .padStart(2, '0')}`;
    }
    getCostAllocation(costAllocationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, offset, limit, searchCondition, filterConditions, empFilterConditions, sortCondition, payPeriodId, timeSheetId, } = costAllocationData;
            const query = Object.assign({ where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, searchCondition), empFilterConditions), { timeActivities: {
                        some: {
                            timeSheetId: timeSheetId,
                        },
                    } }), select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: Object.assign({ timeSheetId: timeSheetId }, filterConditions),
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
            yield Promise.all(costAllocations.map((costAllocation) => __awaiter(this, void 0, void 0, function* () {
                const allTimeActivities = yield prisma_1.prisma.timeActivities.findMany({
                    where: {
                        timeSheetId,
                        employeeId: costAllocation.id,
                    },
                });
                const totalTimeMin = this.totalHoursIntoMin(allTimeActivities);
                employeeRowSpanMapping[costAllocation.fullName] =
                    costAllocation.timeActivities.length;
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
                const totalTime = this.minTohours(totalTimeMin);
                const allTotalColumnsObj = {};
                let totalAllocationPercentage = 0;
                costAllocation === null || costAllocation === void 0 ? void 0 : costAllocation.timeActivities.forEach((timeActivities, timeActivityIndex) => {
                    const costAllocationObj = {
                        id: (0, uuid_1.v4)(),
                    };
                    const hours = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.hours);
                    const minutes = parseInt(timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.minute);
                    const currActivitiesTime = this.hoursToMin(hours, minutes);
                    const allocation = this.allocationPercentage(Number(currActivitiesTime), Number(totalTimeMin));
                    totalAllocationPercentage =
                        totalAllocationPercentage + Number(allocation);
                    if (timeActivityIndex === 0) {
                        costAllocationObj['employee-name'] = costAllocation.fullName;
                    }
                    costAllocationObj['total-hours'] = `${timeActivities.hours}:${timeActivities.minute}`;
                    costAllocationObj['customer-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.customerName;
                    costAllocationObj['class-name'] = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.className;
                    costAllocationObj['allocation'] = `${allocation}%`;
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
                        costAllocationObj[key] = value;
                    });
                    timeActivity.push(costAllocationObj);
                    if ((costAllocation === null || costAllocation === void 0 ? void 0 : costAllocation.timeActivities.length) - 1 ===
                        timeActivityIndex) {
                        const timeActivitiesTotalColumn = Object.assign(Object.assign({}, allTotalColumnsObj), { id: (0, uuid_1.v4)(), type: 'total', allocation: `${totalAllocationPercentage.toFixed(2)}%`, 'total-hours': totalTime, 'employee-name': '' });
                        timeActivity.push(timeActivitiesTotalColumn);
                    }
                });
                response = [...response, ...timeActivity];
            })));
            return { result: response, employeeRowSpanMapping };
        });
    }
}
exports.default = new costAllocationRepository();
