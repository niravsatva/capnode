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
const aws_1 = require("../config/aws");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const timeActivityRepository_1 = __importDefault(require("../repositories/timeActivityRepository"));
const timeSheetRepository_1 = __importDefault(require("../repositories/timeSheetRepository"));
const sqs = new client_sqs_1.SQSClient(aws_1.awsConfig);
class TimeSheetServices {
    // Get all time sheets
    getAllTimeSheets(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, page, limit, search, createdBy, type, sort, startDate, endDate, } = timeSheetData;
            // Offset set
            const offset = (Number(page) - 1) * Number(limit);
            // Filter Conditions
            const filterConditions = [];
            if (createdBy) {
                filterConditions.push({
                    createdBy: {
                        id: createdBy,
                    },
                });
            }
            let dateFilters = {};
            if (startDate && endDate) {
                if (startDate === endDate) {
                    dateFilters = {
                        SubmitedOn: {
                            equals: startDate,
                        },
                    };
                }
                else {
                    dateFilters = {
                        SubmitedOn: {
                            gte: startDate,
                            lt: endDate,
                        },
                    };
                }
            }
            else {
                dateFilters = {};
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
            // Conditions for sort
            const sortCondition = sort
                ? {
                    orderBy: {
                        [sort]: type !== null && type !== void 0 ? type : 'asc',
                    },
                }
                : {
                    orderBy: {
                        SubmitedOn: 'desc',
                    },
                };
            const data = {
                companyId,
                offset: offset,
                limit: limit,
                filterConditions: filterConditions,
                searchCondition: searchCondition,
                sortCondition: sortCondition,
                dateFilters: dateFilters,
            };
            const timeSheets = yield timeSheetRepository_1.default.getAllTimeSheets(data);
            return timeSheets;
        });
    }
    createTimeSheet(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeSheet = yield timeSheetRepository_1.default.createTimeSheet(timeSheetData);
                return timeSheet;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Create a new time sheet
    createTimeSheetByDate(timeSheetData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, name, startDate, endDate, notes, status, user } = timeSheetData;
                console.log('CCC: ', companyId, name, notes, status, user);
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
                const timeLogs = yield timeActivityRepository_1.default.getAllTimeActivities({
                    companyId: companyId,
                    dateFilters: dateFilters,
                });
                const totalHoursAndMinutes = {};
                let finalHours = 0;
                let finalMinutes = 0;
                timeLogs === null || timeLogs === void 0 ? void 0 : timeLogs.forEach((singleActivity) => {
                    const employeeId = singleActivity.employeeId;
                    const hours = Number(singleActivity.hours);
                    const minute = Number(singleActivity.minute);
                    if (!totalHoursAndMinutes[employeeId]) {
                        totalHoursAndMinutes[employeeId] = {
                            totalHours: 0,
                            totalMinutes: 0,
                        };
                    }
                    totalHoursAndMinutes[employeeId].totalHours += hours;
                    totalHoursAndMinutes[employeeId].totalMinutes += minute;
                    // Adjust totalMinutes if it exceeds 59
                    if (totalHoursAndMinutes[employeeId].totalMinutes >= 60) {
                        const additionalHours = Math.floor(totalHoursAndMinutes[employeeId].totalMinutes / 60);
                        totalHoursAndMinutes[employeeId].totalHours += additionalHours;
                        totalHoursAndMinutes[employeeId].totalMinutes %= 60;
                    }
                    finalHours += hours;
                    finalMinutes += minute;
                    if (finalMinutes > 60) {
                        const additionalHours = Math.floor(finalMinutes / 60);
                        finalHours += additionalHours;
                        finalMinutes %= 60;
                    }
                });
                // Create new timesheet
                const finalTimeSheetData = {
                    name: name,
                    totalHours: finalHours.toString(),
                    totalMinute: finalMinutes.toString(),
                    notes: notes,
                    status: status,
                    companyId: companyId,
                    userId: user.id,
                    SubmittedOn: new Date(),
                    startDate: startDate,
                    endDate: endDate,
                };
                const timeSheet = yield timeSheetRepository_1.default.createTimeSheet(finalTimeSheetData);
                const timeSheetLogsData = (_a = Object.entries(totalHoursAndMinutes)) === null || _a === void 0 ? void 0 : _a.map((singleObject) => {
                    return {
                        employeeId: singleObject[0],
                        hours: singleObject[1]['totalHours'].toString(),
                        minute: singleObject[1]['totalMinutes'].toString(),
                        timeSheetsId: timeSheet === null || timeSheet === void 0 ? void 0 : timeSheet.id,
                    };
                });
                const timeSheetLogs = yield (timeSheetRepository_1.default === null || timeSheetRepository_1.default === void 0 ? void 0 : timeSheetRepository_1.default.createTimeSheetLogs(timeSheetLogsData));
                console.log('Time logs: ', timeSheet, timeSheetLogs);
                return timeSheet;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get all time sheet employee logs
    getTimeSheetLogs(timeSheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeSheetDetails = yield timeSheetRepository_1.default.getTimeSheetDetails(timeSheetId);
                if (!timeSheetDetails) {
                    throw new customError_1.CustomError(404, 'Time sheet not found');
                }
                return timeSheetDetails;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Email time sheets
    emailTimeSheet(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeSheetId, employeeList, companyId } = timeSheetData;
                const timeSheetDetails = yield timeSheetRepository_1.default.getTimeSheetDetails(timeSheetId);
                if (!timeSheetDetails) {
                    throw new customError_1.CustomError(404, 'Time sheet not found');
                }
                yield Promise.all(yield employeeList.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    const dateFilters = {
                        activityDate: {
                            gte: timeSheetDetails.startDate,
                            lte: timeSheetDetails.endDate,
                        },
                    };
                    const data = {
                        employeeId: singleEmployee,
                        dateFilters: dateFilters,
                        companyId: companyId,
                    };
                    const allTimeLogs = yield timeActivityRepository_1.default.getTimeActivityByEmployeeDate(data);
                    const employeeDetails = yield repositories_1.employeeRepository.getEmployeeDetails(singleEmployee);
                    const pdfData = {
                        allTimeLogs,
                        startDate: timeSheetDetails.startDate,
                        endDate: timeSheetDetails.endDate,
                        employeeId: singleEmployee.employeeId,
                        totalHours: timeSheetDetails.totalHours,
                        totalMinutes: timeSheetDetails.totalMinute,
                    };
                    const queueData = new client_sqs_1.SendMessageCommand({
                        QueueUrl: `${process.env.QUEUE_URL}`,
                        MessageBody: JSON.stringify({
                            pdfData: pdfData,
                            singleEmployee: employeeDetails,
                        }),
                    });
                    yield sqs.send(queueData);
                    // const pdfData = await timeLogPdfGenerate(
                    // 	allTimeLogs,
                    // 	timeSheetDetails.startDate,
                    // 	timeSheetDetails.endDate,
                    // 	singleEmployee.employeeId,
                    // 	'120'
                    // );
                    // if (employeeDetails?.email) {
                    // 	const response = await axios.post(
                    // 		'https://pdf.satvasolutions.com/api/ConvertHtmlToPdf',
                    // 		{
                    // 			FileName: 'mypdf.pdf',
                    // 			HtmlData: [btoa(pdfData)],
                    // 		}
                    // 	);
                    // 	console.log('RES: ', response.data);
                    // 	const mailOptions = {
                    // 		from: config.smtpEmail,
                    // 		to: employeeDetails?.email,
                    // 		subject: `Actual hours worked Timesheet `,
                    // 		html: 'This is pdf',
                    // 		attachments: [
                    // 			{
                    // 				filename: 'cat.pdf',
                    // 				content: response.data,
                    // 				encoding: 'base64',
                    // 			},
                    // 		],
                    // 		// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                    // 	};
                    // 	sendEmail(mailOptions);
                    // }
                })));
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new TimeSheetServices();
