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
/* eslint-disable no-mixed-spaces-and-tabs */
const client_sqs_1 = require("@aws-sdk/client-sqs");
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../client/prisma");
const aws_1 = require("../config/aws");
const global_1 = require("../helpers/global");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const payPeriodRepository_1 = __importDefault(require("../repositories/payPeriodRepository"));
const timeSheetRepository_1 = __importDefault(require("../repositories/timeSheetRepository"));
const timeSheetPdf_1 = require("../templates/timeSheetPdf");
const timeActivityServices_1 = __importDefault(require("./timeActivityServices"));
const sqs = new client_sqs_1.SQSClient(aws_1.awsConfig);
class TimeSheetServices {
    // Get all time sheets
    getAllTimeSheets(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId, page, limit, search, createdBy, type, sort, } = timeSheetData;
            if (!companyId) {
                throw new customError_1.CustomError(400, 'Company id is required');
            }
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            // Offset set
            const offset = (Number(page) - 1) * Number(limit);
            // Filter Conditions
            let filterConditions = {};
            if (createdBy) {
                filterConditions = {
                    createdBy: {
                        id: createdBy,
                    },
                };
            }
            let payPeriodFilter = {};
            if (payPeriodId) {
                payPeriodFilter = {
                    payPeriodId: payPeriodId,
                };
            }
            // Conditions for searching
            const searchCondition = search
                ? {
                    OR: [
                        {
                            name: { contains: search, mode: 'insensitive' },
                        },
                    ],
                }
                : {};
            const orderByArray = [];
            if (sort === 'createdByName') {
                orderByArray.push({
                    createdBy: {
                        firstName: type ? type : 'desc',
                    },
                });
            }
            if (sort === 'status') {
                orderByArray.push({
                    status: type ? type : 'desc',
                });
            }
            orderByArray.push({
                id: 'desc',
            });
            const sortCondition = {
                orderBy: orderByArray,
            };
            const data = {
                companyId,
                offset: offset,
                limit: limit,
                filterConditions: filterConditions,
                searchCondition: searchCondition,
                sortCondition: sortCondition,
                payPeriodFilter: payPeriodFilter,
            };
            const { timeSheets, count } = yield timeSheetRepository_1.default.getAllTimeSheets(data);
            timeSheets.forEach((singleTimeSheet) => {
                var _a, _b;
                let approvedHours = 0;
                singleTimeSheet.timeActivities.forEach((singleTimeActivity) => {
                    approvedHours += singleTimeActivity.hours
                        ? Number(singleTimeActivity.hours) * 60 +
                            Number(singleTimeActivity.minute)
                        : Number(singleTimeActivity.minute);
                });
                const formattedHours = (0, global_1.minutesToHoursAndMinutes)(approvedHours);
                singleTimeSheet['approvedHours'] = formattedHours;
                singleTimeSheet['createdByName'] =
                    ((_a = singleTimeSheet === null || singleTimeSheet === void 0 ? void 0 : singleTimeSheet.createdBy) === null || _a === void 0 ? void 0 : _a.firstName) +
                        ' ' +
                        ((_b = singleTimeSheet === null || singleTimeSheet === void 0 ? void 0 : singleTimeSheet.createdBy) === null || _b === void 0 ? void 0 : _b.lastName);
                delete singleTimeSheet.timeActivities;
            });
            return { timeSheets, count };
        });
    }
    createTimeSheet(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId } = timeSheetData;
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const payPeriodDetails = yield payPeriodRepository_1.default.getDetails(payPeriodId, companyId);
            if (!payPeriodDetails) {
                throw new customError_1.CustomError(400, 'Pay period not found');
            }
            const timeActivities = yield timeActivityServices_1.default.getAllTimeActivitiesServices({
                companyId: companyId,
                payPeriodId: payPeriodId,
            });
            // timeSheetData['timeActivities'] =
            // 	timeActivities.timeActivitiesWithHours.map(
            // 		(singleActivity: any) => singleActivity.id
            // 	);
            timeSheetData['timeActivities'] =
                timeActivities.timeActivitiesWithHours.filter((singleActivity) => {
                    if (singleActivity.classId && singleActivity.customerId) {
                        return singleActivity.id;
                    }
                });
            // if (!name) {
            // 	const startDate = moment(payPeriodDetails.startDate).format('MM-DD-YYYY');
            // 	const endDate = moment(payPeriodDetails.endDate).format('MM-DD-YYYY');
            // 	timeSheetData['name'] = `Timesheet (${startDate} - ${endDate})`;
            // }
            const timeSheet = yield timeSheetRepository_1.default.createTimeSheet(timeSheetData);
            return timeSheet;
        });
    }
    // Email time sheets
    emailTimeSheet(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeSheetId, employeeList, companyId } = timeSheetData;
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(400, 'Company not found');
                }
                const timeSheetDetails = yield timeSheetRepository_1.default.getTimeSheetDetails(timeSheetId);
                if (!timeSheetDetails) {
                    throw new customError_1.CustomError(400, 'Time sheet not found');
                }
                yield Promise.all(yield employeeList.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    const data = {
                        employeeId: singleEmployee,
                        companyId: companyId,
                        payPeriodId: timeSheetDetails.payPeriodId,
                    };
                    const { timeActivitiesWithHours: allTimeLogs } = yield timeActivityServices_1.default.getAllTimeActivitiesServices(data);
                    const customerIds = [];
                    const { startDate, endDate } = yield payPeriodRepository_1.default.getDatesByPayPeriod(timeSheetDetails.payPeriodId);
                    let approvedHours = 0;
                    allTimeLogs.forEach((singleTimeActivity) => {
                        if (!customerIds.includes(singleTimeActivity.customerId)) {
                            customerIds.push(singleTimeActivity.customerId);
                        }
                        approvedHours += (0, global_1.getTotalMinutes)(singleTimeActivity.hours, singleTimeActivity.minute);
                    });
                    const formattedHours = (0, global_1.minutesToHoursAndMinutes)(approvedHours);
                    const uniqueCustomers = [];
                    customerIds.forEach((singleCustomer) => {
                        let customerMinutes = 0;
                        const customerObject = {};
                        let customerName = '';
                        allTimeLogs.forEach((singleTimeActivity) => {
                            if (singleTimeActivity.customerId === singleCustomer) {
                                customerMinutes += (0, global_1.getTotalMinutes)(singleTimeActivity.hours, singleTimeActivity.minute);
                                customerName = singleTimeActivity.customerName;
                            }
                        });
                        customerObject['customerName'] = customerName;
                        customerObject['hours'] = (0, global_1.minutesToHoursAndMinutes)(customerMinutes);
                        uniqueCustomers.push(customerObject);
                    });
                    const pdfData = {
                        allTimeLogs,
                        startDate: startDate,
                        endDate: endDate,
                        employeeId: singleEmployee,
                        totalHours: formattedHours.split(':')[0],
                        totalMinutes: formattedHours.split(':')[1],
                    };
                    const employeeDetails = yield repositories_1.employeeRepository.getEmployeeDetails(singleEmployee);
                    const queueData = new client_sqs_1.SendMessageCommand({
                        QueueUrl: `${process.env.QUEUE_URL}`,
                        MessageBody: JSON.stringify({
                            pdfData: pdfData,
                            singleEmployee: employeeDetails,
                            customers: uniqueCustomers,
                        }),
                    });
                    yield sqs.send(queueData);
                })));
            }
            catch (err) {
                throw err;
            }
        });
    }
    getTimeSheetByPayPeriod(payPeriodId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheetData = yield prisma_1.prisma.timeSheets.findUnique({
                where: {
                    payPeriodId,
                },
            });
            if (timeSheetData && timeSheetData.companyId != companyId) {
                throw new customError_1.CustomError(400, 'Can not access timesheet');
            }
            return timeSheetData;
        });
    }
    getTimeSheetWiseEmployees(timeSheetId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!timeSheetId) {
                throw new customError_1.CustomError(400, 'Time Sheet id is required');
            }
            if (!companyId) {
                throw new customError_1.CustomError(400, 'Company id is required');
            }
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const timeSheetDetails = yield timeSheetRepository_1.default.getTimeSheetDetails(timeSheetId);
            if (!timeSheetDetails) {
                throw new customError_1.CustomError(400, 'Time sheet not found');
            }
            const timeSheet = yield timeSheetRepository_1.default.getEmployees(timeSheetId, companyId);
            const employeeIds = [];
            const newEmployees = [];
            timeSheet === null || timeSheet === void 0 ? void 0 : timeSheet.timeActivities.forEach((singleActivity) => {
                if (!employeeIds.includes(singleActivity.employee.id)) {
                    employeeIds.push(singleActivity.employee.id);
                }
            });
            employeeIds.forEach((singleId) => {
                let minutes = 0;
                const objectEmp = {};
                const newArr = timeSheet === null || timeSheet === void 0 ? void 0 : timeSheet.timeActivities.filter((singleActivity) => singleActivity.employee.id == singleId);
                newArr === null || newArr === void 0 ? void 0 : newArr.forEach((singleItem) => {
                    minutes =
                        (singleItem.hours
                            ? Number(singleItem.hours) * 60 + Number(singleItem.minute)
                            : Number(singleItem.minute)) + Number(minutes);
                    objectEmp['employeeId'] = singleItem.employee.id;
                    objectEmp['employeeName'] = singleItem.employee.fullName;
                    objectEmp['email'] = singleItem.employee.email;
                });
                // Convert minutes to hours
                const finalHours = (0, global_1.minutesToHoursAndMinutes)(minutes);
                objectEmp['approvedHours'] = finalHours;
                newEmployees.push(objectEmp);
            });
            // timeSheet &&
            // 	timeSheet.timeActivities.map((singleActivity: any) => {
            // 		let minutes = 0;
            // 		if (singleActivity.hours) {
            // 			minutes =
            // 				Number(singleActivity.hours) * 60 + Number(singleActivity.minute);
            // 		} else {
            // 			minutes = Number(singleActivity.minute);
            // 		}
            // 		if (object[singleActivity.employee.id]) {
            // 			object[singleActivity.employee.id] += Number(minutes);
            // 		} else {
            // 			object[singleActivity.employee.id] = minutes;
            // 		}
            // 	});
            return newEmployees;
        });
    }
    exportTimeSheetPdf(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { timeSheetId, employeeId, companyId } = timeSheetData;
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const timeSheetDetails = yield timeSheetRepository_1.default.getTimeSheetDetails(timeSheetId);
            if (!timeSheetDetails) {
                throw new customError_1.CustomError(400, 'Time sheet not found');
            }
            const employeeDetails = yield repositories_1.employeeRepository.getEmployeeDetails(employeeId);
            if (!employeeDetails) {
                throw new customError_1.CustomError(400, 'Employee not found');
            }
            const data = {
                employeeId: employeeId,
                companyId: companyId,
                payPeriodId: timeSheetDetails.payPeriodId,
            };
            // Get time logs for employee
            const { timeActivitiesWithHours: allTimeLogs } = yield timeActivityServices_1.default.getAllTimeActivitiesServices(data);
            const customerIds = [];
            const { startDate, endDate } = yield payPeriodRepository_1.default.getDatesByPayPeriod(timeSheetDetails.payPeriodId);
            let approvedHours = 0;
            allTimeLogs.forEach((singleTimeActivity) => {
                if (!customerIds.includes(singleTimeActivity.customerId)) {
                    customerIds.push(singleTimeActivity.customerId);
                }
                approvedHours += (0, global_1.getTotalMinutes)(singleTimeActivity.hours, singleTimeActivity.minute);
            });
            const formattedHours = (0, global_1.minutesToHoursAndMinutes)(approvedHours);
            const uniqueCustomers = [];
            customerIds.forEach((singleCustomer) => {
                let customerMinutes = 0;
                const customerObject = {};
                let customerName = '';
                allTimeLogs.forEach((singleTimeActivity) => {
                    if (singleTimeActivity.customerId === singleCustomer) {
                        customerMinutes += (0, global_1.getTotalMinutes)(singleTimeActivity.hours, singleTimeActivity.minute);
                        customerName = singleTimeActivity.customerName;
                    }
                });
                customerObject['customerName'] = customerName;
                customerObject['hours'] = (0, global_1.minutesToHoursAndMinutes)(customerMinutes);
                uniqueCustomers.push(customerObject);
            });
            const pdfData = {
                allTimeLogs,
                startDate: startDate,
                endDate: endDate,
                employeeId: employeeId,
                totalHours: formattedHours.split(':')[0],
                totalMinutes: formattedHours.split(':')[1],
            };
            const pdfHTML = (0, timeSheetPdf_1.generatePdf)(pdfData, employeeDetails, uniqueCustomers);
            const response = yield axios_1.default.post('https://pdf.satvasolutions.com/api/ConvertHtmlToPdf', {
                FileName: `${employeeDetails === null || employeeDetails === void 0 ? void 0 : employeeDetails.fullName}_${(0, moment_1.default)(pdfData.startDate).format('MM/DD/YYYY')} - ${(0, moment_1.default)(pdfData.endDate).format('MM/DD/YYYY')}.pdf`,
                HtmlData: [btoa(pdfHTML)],
            });
            return response;
        });
    }
}
exports.default = new TimeSheetServices();
