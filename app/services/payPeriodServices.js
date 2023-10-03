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
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const payPeriodRepository_1 = __importDefault(require("../repositories/payPeriodRepository"));
class payPeriodServices {
    getAllPayPeriods(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyId = payPeriodData.companyId;
            const { page, limit, year } = payPeriodData;
            const offset = (Number(page) - 1) * Number(limit);
            // Check If company exists
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            let dateFilter = {};
            if (year) {
                const startDateOfYear = new Date(`${Number(year)}-01-01T00:00:00.000Z`);
                const endDateOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
                dateFilter = {
                    OR: [
                        {
                            startDate: {
                                gte: startDateOfYear,
                                lt: endDateOfYear,
                            },
                        },
                        {
                            endDate: {
                                gte: startDateOfYear,
                                lt: endDateOfYear,
                            },
                        },
                    ],
                };
            }
            const data = {
                offset: offset,
                limit: limit,
                companyId: companyId,
                dateFilter: dateFilter,
            };
            const payPeriods = yield payPeriodRepository_1.default.getAll(data);
            return payPeriods;
        });
    }
    count(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId } = payPeriodData;
            const payPeriodCount = yield prisma_1.prisma.payPeriod.count({
                where: {
                    companyId: companyId,
                },
            });
            return payPeriodCount;
        });
    }
    createNewPayPeriod(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, startDate, endDate } = payPeriodData;
            // Check If company exists
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            if (endDate < startDate) {
                throw new customError_1.CustomError(400, 'Start date must be before end date');
            }
            const { isInPayPeriod } = yield payPeriodRepository_1.default.isDateInAnyPayPeriod(payPeriodData);
            if (isInPayPeriod) {
                throw new customError_1.CustomError(400, 'Dates are already in pay period');
            }
            const payPeriod = yield payPeriodRepository_1.default.create(payPeriodData);
            // Create employee cost value for this pay period
            const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
            if (employees.length === 0) {
                const error = new customError_1.CustomError(404, 'No employee found in this company');
                throw error;
            }
            yield repositories_1.employeeCostRepository.createMonthlyCost(employees, companyId, payPeriod.id);
            return payPeriod;
        });
    }
    editPayPeriod(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyId = payPeriodData.companyId;
            // Check If company exists
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(404, 'Company not found');
            }
            const { isInPayPeriod, payPeriod } = yield payPeriodRepository_1.default.isDateInAnyPayPeriod(payPeriodData);
            if (isInPayPeriod && payPeriod.id != payPeriodData.id) {
                throw new customError_1.CustomError(400, 'Dates are already in pay period');
            }
            const data = yield payPeriodRepository_1.default.update(payPeriodData);
            return data;
        });
    }
    getAllPayPeriodDates(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId,
                },
                orderBy: {
                    startDate: 'asc',
                },
            });
            const dates = [];
            payPeriods.forEach((e) => {
                const startDate = new Date(e.startDate);
                const endDate = new Date(e.endDate);
                // Calculate the difference in milliseconds between start and end dates
                const timeDiff = endDate - startDate;
                // Calculate the number of days between start and end dates
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                // Push the start date into the result array
                dates.push((0, moment_1.default)(startDate).format('YYYY-MM-DD'));
                // Push all dates in between
                for (let i = 1; i < daysDiff; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    dates.push((0, moment_1.default)(date).format('YYYY-MM-DD'));
                }
                // Push the end date into the result array
                dates.push((0, moment_1.default)(endDate).format('YYYY-MM-DD'));
            });
            return dates;
        });
    }
}
exports.default = new payPeriodServices();