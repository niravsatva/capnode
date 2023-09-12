"use strict";
/* eslint-disable no-mixed-spaces-and-tabs */
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
const prisma_1 = require("../client/prisma");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const customError_1 = require("../models/customError");
const quickbooksClient_1 = __importDefault(require("../quickbooksClient/quickbooksClient"));
const repositories_1 = require("../repositories");
const timeActivityRepository_1 = __importDefault(require("../repositories/timeActivityRepository"));
const quickbooksServices_1 = __importDefault(require("./quickbooksServices"));
class TimeActivityService {
    // Get all time activities
    getAllTimeActivitiesServices(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, search, sort, page, limit, type, classId, customerId, employeeId, startDate, endDate, } = timeActivityData;
            // Offset set
            const offset = (Number(page) - 1) * Number(limit);
            // Set filter conditions
            const filteredData = [];
            if (classId) {
                filteredData.push({ classId: classId });
            }
            if (customerId) {
                filteredData.push({ customerId: customerId });
            }
            if (employeeId) {
                filteredData.push({
                    employee: {
                        id: employeeId,
                    },
                });
            }
            const filterConditions = (filteredData === null || filteredData === void 0 ? void 0 : filteredData.length) > 0
                ? {
                    AND: filteredData,
                }
                : {};
            let dateFilters = {};
            if (startDate && endDate) {
                if (startDate === endDate) {
                    dateFilters = {
                        activityDate: {
                            equals: startDate,
                        },
                    };
                }
                else {
                    dateFilters = {
                        activityDate: {
                            gte: startDate,
                            lte: endDate,
                        },
                    };
                }
            }
            else {
                dateFilters = {};
            }
            // const dateFilters =
            // 	startDate && endDate
            // 		? {
            // 				activityDate: {
            // 					gte: startDate,
            // 					lte: endDate,
            // 				},
            // 		  }
            // 		: {};
            // Conditions for searching
            const searchCondition = search
                ? {
                    OR: [
                        {
                            className: { contains: search, mode: 'insensitive' },
                        },
                        {
                            customerName: { contains: search, mode: 'insensitive' },
                        },
                        {
                            employee: {
                                fullName: { contains: search, mode: 'insensitive' },
                            },
                        },
                    ],
                }
                : {};
            // Conditions for sort
            const sortCondition = sort
                ? {
                    orderBy: {
                        [sort]: type !== null && type !== void 0 ? type : 'asc',
                    },
                }
                : {
                    orderBy: {
                        activityDate: 'desc',
                    },
                };
            if (sort === 'employee') {
                sortCondition['orderBy'] = {
                    employee: {
                        fullName: type,
                    },
                };
            }
            // Check if company exists or not
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            const timeActivities = yield timeActivityRepository_1.default.getAllTimeActivities({
                companyId: companyId,
                offset: offset,
                limit: limit,
                filterConditions: filterConditions,
                searchCondition: searchCondition,
                sortCondition: sortCondition,
                dateFilters: dateFilters,
            });
            // const finalData = await Promise.all(
            // 	await timeActivities?.map(async (singleActivity) => {
            // 		const field = await prisma.field.findFirst({
            // 			where: {
            // 				companyId: singleActivity?.companyId as string,
            // 				name: 'Maximum allocate hours per year',
            // 			},
            // 		});
            // 		const data = {
            // 			employeeId: singleActivity?.employeeId,
            // 			companyId: singleActivity?.companyId,
            // 			year: new Date(singleActivity.activityDate).getFullYear(),
            // 			fieldId: field?.id,
            // 		};
            // 		const hours = await timeActivityRepository.getEmployeeHours(data);
            // 		return hours;
            // 	})
            // );
            // console.log('Final data: ', finalData);
            const timeActivitiesCount = yield timeActivityRepository_1.default.getAllTimeActivitiesCount({
                companyId: companyId,
            });
            return { timeActivities, timeActivitiesCount };
        });
    }
    syncTimeActivities(companyId) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            // Get access token for quickbooks
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            // If company exists - sync time activities by last sync
            if (companyDetails) {
                const timeActivities = yield this.syncTimeActivityFirstTime({
                    accessToken: authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken,
                    refreshToken: authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken,
                    tenantID: authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID,
                    companyId: companyId,
                });
                if (timeActivities &&
                    ((_b = (_a = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.QueryResponse) === null || _a === void 0 ? void 0 : _a.TimeActivity) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                    // Filtered vendors, fetching employees only
                    const filteredEmployees = (_d = (_c = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.QueryResponse) === null || _c === void 0 ? void 0 : _c.TimeActivity) === null || _d === void 0 ? void 0 : _d.filter((timeActivity) => timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EmployeeRef);
                    yield Promise.all(filteredEmployees === null || filteredEmployees === void 0 ? void 0 : filteredEmployees.map((timeActivity) => __awaiter(this, void 0, void 0, function* () {
                        var _f, _g, _h, _j, _k, _l, _m;
                        const data = {
                            timeActivityId: timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Id,
                            classId: ((_f = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.ClassRef) === null || _f === void 0 ? void 0 : _f.value) || null,
                            className: ((_g = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.ClassRef) === null || _g === void 0 ? void 0 : _g.name) || null,
                            customerId: ((_h = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.CustomerRef) === null || _h === void 0 ? void 0 : _h.value) || null,
                            customerName: ((_j = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.CustomerRef) === null || _j === void 0 ? void 0 : _j.name) || null,
                            hours: ((_k = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) === null || _k === void 0 ? void 0 : _k.toString()) || '0',
                            minute: ((_l = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) === null || _l === void 0 ? void 0 : _l.toString()) || '0',
                            activityDate: timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.TxnDate,
                            employeeId: (_m = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EmployeeRef) === null || _m === void 0 ? void 0 : _m.value,
                        };
                        // update or create time activity
                        return yield timeActivityRepository_1.default.updateOrCreateTimeActivity(timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Id, companyId, data);
                    })));
                    return (_e = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.QueryResponse) === null || _e === void 0 ? void 0 : _e.TimeActivity;
                    // console.log('My time activities: ', timeActivities);
                }
                else {
                    // Else - sync time activities for the first time
                    const timeActivities = yield this.syncTimeActivityFirstTime({
                        accessToken: authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken,
                        refreshToken: authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken,
                        tenantID: authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID,
                        companyId: companyId,
                    });
                    console.log('Time Activities: ', timeActivities);
                }
            }
        });
    }
    lambdaSyncFunction(timeActivityData) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { accessToken, tenantId, refreshToken, companyId, timeActivityLastSyncDate, } = timeActivityData;
            if (timeActivityLastSyncDate) {
                // Last sync exists
                console.log('TIME Activity Last Sync exist');
            }
            else {
                // Last sync does not exist - time activity sync for the first time
                // Find all time activities from quickbooks
                const timeActivities = yield quickbooksClient_1.default.getAllTimeActivities(accessToken, tenantId, refreshToken);
                if (timeActivities &&
                    ((_b = (_a = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.QueryResponse) === null || _a === void 0 ? void 0 : _a.TimeActivity) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                    // Filtered vendors, fetching employees only
                    const filteredEmployees = (_d = (_c = timeActivities === null || timeActivities === void 0 ? void 0 : timeActivities.QueryResponse) === null || _c === void 0 ? void 0 : _c.TimeActivity) === null || _d === void 0 ? void 0 : _d.filter((timeActivity) => timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EmployeeRef);
                    yield Promise.all(filteredEmployees === null || filteredEmployees === void 0 ? void 0 : filteredEmployees.map((timeActivity) => __awaiter(this, void 0, void 0, function* () {
                        var _e, _f, _g, _h, _j, _k, _l;
                        let hours = 0;
                        let minutes = 0;
                        if ((timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) !== null &&
                            (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) !== undefined &&
                            (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) !== null &&
                            (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) !== undefined) {
                            hours = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours;
                            minutes = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes;
                        }
                        else if ((timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) == 0 && (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) == 0) {
                            hours = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours;
                            minutes = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes;
                        }
                        else {
                            const start = new Date(timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.StartTime);
                            const end = new Date(timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EndTime);
                            const breakHours = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.BreakHours; // Example break hours
                            const breakMinutes = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.BreakMinutes; // Example break minutes
                            // Calculate the total time duration in milliseconds
                            let totalTimeInMillis = end - start;
                            // If the start date is greater than end date
                            if (start > end) {
                                const nextDay = new Date(start);
                                nextDay.setDate(nextDay.getDate() + 1);
                                totalTimeInMillis += nextDay - start;
                            }
                            // Calculate the break time in milliseconds
                            const breakTimeInMillis = (breakHours * 60 + breakMinutes) * 60 * 1000;
                            // Calculate the effective work duration
                            const effectiveTimeInMillis = totalTimeInMillis - breakTimeInMillis;
                            // Calculate hours and minutes from milliseconds
                            const effectiveHours = Math.floor(effectiveTimeInMillis / (60 * 60 * 1000));
                            const effectiveMinutes = Math.floor((effectiveTimeInMillis % (60 * 60 * 1000)) / (60 * 1000));
                            hours = effectiveHours;
                            minutes = effectiveMinutes;
                        }
                        const data = {
                            timeActivityId: timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Id,
                            classId: ((_e = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.ClassRef) === null || _e === void 0 ? void 0 : _e.value) || null,
                            className: ((_f = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.ClassRef) === null || _f === void 0 ? void 0 : _f.name) || null,
                            customerId: ((_g = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.CustomerRef) === null || _g === void 0 ? void 0 : _g.value) || null,
                            customerName: ((_h = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.CustomerRef) === null || _h === void 0 ? void 0 : _h.name) || null,
                            hours: ((_j = hours === null || hours === void 0 ? void 0 : hours.toString()) === null || _j === void 0 ? void 0 : _j.padStart(2, '0')) || '00',
                            minute: ((_k = minutes === null || minutes === void 0 ? void 0 : minutes.toString()) === null || _k === void 0 ? void 0 : _k.padStart(2, '0')) || '00',
                            // hours: timeActivity?.Hours?.toString() || '0',
                            // minute: timeActivity?.Minutes?.toString() || '0',
                            activityDate: timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.TxnDate,
                            employeeId: (_l = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EmployeeRef) === null || _l === void 0 ? void 0 : _l.value,
                            companyId: companyId,
                        };
                        // Dump time activity in the database for the first time
                        return yield timeActivityRepository_1.default.createTimeActivitySync(data, companyId);
                    })));
                    yield prisma_1.prisma.company.update({
                        where: {
                            id: companyId,
                        },
                        data: {
                            timeActivitiesLastSyncDate: (0, moment_timezone_1.default)(new Date())
                                .tz('America/Los_Angeles')
                                .format(),
                        },
                    });
                }
            }
        });
    }
    syncTimeActivityFirstTime(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accessToken, refreshToken, tenantID } = timeActivityData;
            // Find all time activities from quickbooks
            const timeActivities = yield quickbooksClient_1.default.getAllTimeActivities(accessToken, tenantID, refreshToken);
            return timeActivities;
            // Dump all time activities in db
        });
    }
    syncTimeActivityByLastSync(companyId) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if company exists or not
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                // DO NOT REMOVE THIS CODE
                // LAMBDA FUNCTION CALL
                // const syncData = await axios.post(
                // 	config.employeeSyncLambdaEndpoint,
                // 	{
                // 		accessToken: authResponse?.accessToken,
                // 		refreshToken: authResponse?.refreshToken,
                // 		tenantID: authResponse?.tenantID,
                // 		companyId: companyId,
                // 		employeeLastSyncDate: companyDetails?.employeeLastSyncDate,
                // 	},
                // 	{
                // 		headers: {
                // 			'x-api-key': config.employeeSyncLambdaApiKey,
                // 			'Content-Type': 'application/json',
                // 		},
                // 	}
                // );
                // return syncData?.data;
                // LAMBDA FUNCTION CALL
                // For local API
                // Get employees by last sync from Quickbooks
                const newTimeActivities = yield (quickbooksClient_1.default === null || quickbooksClient_1.default === void 0 ? void 0 : quickbooksClient_1.default.getTimeActivitiesByLastSync(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.timeActivitiesLastSyncDate));
                // If new records found
                let timeActivityArr = [];
                if (newTimeActivities &&
                    ((_b = (_a = newTimeActivities === null || newTimeActivities === void 0 ? void 0 : newTimeActivities.QueryResponse) === null || _a === void 0 ? void 0 : _a.TimeActivity) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                    // Filtered vendors, fetching employees only
                    const filteredEmployees = (_d = (_c = newTimeActivities === null || newTimeActivities === void 0 ? void 0 : newTimeActivities.QueryResponse) === null || _c === void 0 ? void 0 : _c.TimeActivity) === null || _d === void 0 ? void 0 : _d.filter((timeActivity) => timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EmployeeRef);
                    timeActivityArr = yield Promise.all(filteredEmployees === null || filteredEmployees === void 0 ? void 0 : filteredEmployees.map((timeActivity) => __awaiter(this, void 0, void 0, function* () {
                        var _e, _f, _g, _h, _j, _k, _l;
                        let hours = '0';
                        let minutes = '0';
                        if ((timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) !== null &&
                            (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) !== undefined &&
                            (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) !== null &&
                            (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) !== undefined) {
                            hours = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours;
                            minutes = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes;
                        }
                        else if ((timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours) == 0 && (timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes) == 0) {
                            hours = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Hours;
                            minutes = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Minutes;
                        }
                        else {
                            const start = new Date(timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.StartTime);
                            const end = new Date(timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EndTime);
                            const breakHours = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.BreakHours; // Example break hours
                            const breakMinutes = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.BreakMinutes; // Example break minutes
                            // Calculate the total time duration in milliseconds
                            let totalTimeInMillis = end - start;
                            // If the start date is greater than end date
                            if (start > end) {
                                const nextDay = new Date(start);
                                nextDay.setDate(nextDay.getDate() + 1);
                                totalTimeInMillis += nextDay - start;
                            }
                            // Calculate the break time in milliseconds
                            const breakTimeInMillis = (breakHours * 60 + breakMinutes) * 60 * 1000;
                            // Calculate the effective work duration
                            const effectiveTimeInMillis = totalTimeInMillis - breakTimeInMillis;
                            // Calculate hours and minutes from milliseconds
                            const effectiveHours = Math.floor(effectiveTimeInMillis / (60 * 60 * 1000));
                            const effectiveMinutes = Math.floor((effectiveTimeInMillis % (60 * 60 * 1000)) / (60 * 1000));
                            hours = effectiveHours;
                            minutes = effectiveMinutes;
                        }
                        const timeActivityData = {
                            timeActivityId: timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Id,
                            classId: ((_e = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.ClassRef) === null || _e === void 0 ? void 0 : _e.value) || null,
                            className: ((_f = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.ClassRef) === null || _f === void 0 ? void 0 : _f.name) || null,
                            customerId: ((_g = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.CustomerRef) === null || _g === void 0 ? void 0 : _g.value) || null,
                            customerName: ((_h = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.CustomerRef) === null || _h === void 0 ? void 0 : _h.name) || null,
                            hours: ((_j = hours === null || hours === void 0 ? void 0 : hours.toString()) === null || _j === void 0 ? void 0 : _j.padStart(2, '0')) || '00',
                            minute: ((_k = minutes === null || minutes === void 0 ? void 0 : minutes.toString()) === null || _k === void 0 ? void 0 : _k.padStart(2, '0')) || '00',
                            // hours: timeActivity?.Hours?.toString() || '0',
                            // minute: timeActivity?.Minutes?.toString() || '0',
                            activityDate: timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.TxnDate,
                            employeeId: (_l = timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.EmployeeRef) === null || _l === void 0 ? void 0 : _l.value,
                        };
                        // Update or create timeActivity in db
                        return yield timeActivityRepository_1.default.updateOrCreateTimeActivity(timeActivity === null || timeActivity === void 0 ? void 0 : timeActivity.Id, companyId, timeActivityData);
                    })));
                }
                // Update time activity last sync date
                yield prisma_1.prisma.company.update({
                    where: {
                        id: companyId,
                    },
                    data: {
                        timeActivitiesLastSyncDate: (0, moment_timezone_1.default)(new Date())
                            .tz('America/Los_Angeles')
                            .format(),
                    },
                });
                return timeActivityArr;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update hours for time activity in DB
    updateTimeActivity(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, timeActivityId, hours, minute } = timeActivityData;
            // Check if company exists or not
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            // Update time logs
            const updated = yield timeActivityRepository_1.default.updateTimeActivity({
                timeActivityId: timeActivityId,
                companyId: companyId,
                hours: hours,
                minute: minute,
            });
            return updated;
        });
    }
    // Create a new time activity in DB
    createTimeActivity(createTimeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, employeeId } = createTimeActivityData;
            // Check if company exists or not
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            if (employeeId) {
                // Check if employee found
                const employeeDetails = yield repositories_1.employeeRepository.getEmployeeDetails(employeeId);
                if (!employeeDetails) {
                    throw new customError_1.CustomError(404, 'Employee not found');
                }
            }
            const createdTimeActivity = yield timeActivityRepository_1.default.createTimeActivity(createTimeActivityData);
            return createdTimeActivity;
        });
    }
    // Delete time activity from DB
    deleteTimeActivity(timeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, timeActivityId } = timeActivityData;
            // Check if company exists or not
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            // Deleted time logs
            const deleted = yield timeActivityRepository_1.default.deleteTimeActivity({
                timeActivityId: timeActivityId,
                companyId: companyId,
            });
            return deleted;
        });
    }
    // Export Time Activity
    exportTimeActivity(companyId, search, classId, customerId, employeeId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check If company exists
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            // Set filter conditions
            const filteredData = [];
            if (classId) {
                filteredData.push({ classId: classId });
            }
            if (customerId) {
                filteredData.push({ customerId: customerId });
            }
            if (employeeId) {
                filteredData.push({
                    employee: {
                        id: employeeId,
                    },
                });
            }
            const filterConditions = (filteredData === null || filteredData === void 0 ? void 0 : filteredData.length) > 0
                ? {
                    AND: filteredData,
                }
                : {};
            const dateFilters = startDate && endDate
                ? {
                    activityDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                }
                : {};
            // Conditions for searching
            const searchCondition = search
                ? {
                    OR: [
                        {
                            className: { contains: search, mode: 'insensitive' },
                        },
                        {
                            customerName: { contains: search, mode: 'insensitive' },
                        },
                        {
                            employee: {
                                fullName: { contains: search, mode: 'insensitive' },
                            },
                        },
                    ],
                }
                : {};
            const getAllActivities = yield timeActivityRepository_1.default.getAllTimeActivityForExport({
                companyId: companyId,
                filterConditions: filterConditions,
                searchCondition: searchCondition,
                dateFilters: dateFilters,
            });
            const finalActivities = getAllActivities === null || getAllActivities === void 0 ? void 0 : getAllActivities.map((singleTimeActivity) => {
                var _a;
                return {
                    'Activity Date': (0, moment_timezone_1.default)(singleTimeActivity.activityDate).format('MM/DD/YYYY'),
                    'Employee Name': (_a = singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.employee) === null || _a === void 0 ? void 0 : _a.fullName,
                    Customer: (singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.customerName)
                        ? singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.customerName
                        : 'NA',
                    Class: (singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.className)
                        ? singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.className
                        : 'NA',
                    Hours: `${singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.hours}:${singleTimeActivity === null || singleTimeActivity === void 0 ? void 0 : singleTimeActivity.minute}`,
                };
            });
            return finalActivities;
        });
    }
}
exports.default = new TimeActivityService();
