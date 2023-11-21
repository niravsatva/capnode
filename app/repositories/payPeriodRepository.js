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
class PayPeriodRepository {
    getAll(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, dateFilter, offset, limit } = payPeriodData;
            const query = {
                where: Object.assign({ companyId: companyId }, dateFilter),
                skip: offset,
                take: limit,
                orderBy: {
                    startDate: 'desc',
                },
            };
            if (!offset) {
                delete query.skip;
            }
            if (!limit) {
                delete query.take;
            }
            const payPeriods = yield prisma_1.prisma.payPeriod.findMany(query);
            return payPeriods;
        });
    }
    getDetails(payPeriodId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payPeriodDetails = yield prisma_1.prisma.payPeriod.findUnique({
                where: {
                    id: payPeriodId,
                },
            });
            if (payPeriodDetails && payPeriodDetails.companyId != companyId) {
                throw new customError_1.CustomError(400, 'Invalid PayPeriod');
            }
            return payPeriodDetails;
        });
    }
    create(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const payPeriod = yield prisma_1.prisma.payPeriod.create({
                data: {
                    startDate: payPeriodData.startDate,
                    endDate: payPeriodData.endDate,
                    company: { connect: { id: payPeriodData.companyId } },
                },
            });
            return payPeriod;
        });
    }
    isDateInAnyPayPeriod(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate, companyId } = payPeriodData;
            const allPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId: companyId,
                },
            });
            for (const payPeriod of allPayPeriods) {
                if (startDate < new Date(payPeriod.endDate).setUTCHours(23, 59, 59, 59) &&
                    endDate > new Date(payPeriod.startDate).setUTCHours(0, 0, 0, 0)) {
                    return { isInPayPeriod: true, payPeriod: payPeriod }; // The date is in a pay period
                }
                // if (
                // 	new Date(payPeriod.startDate).setUTCHours(0, 0, 0, 0) <= startDate && // Check if startDate is less than or equal to the checkDate
                // 	new Date(payPeriod.endDate).setUTCHours(23, 59, 59, 59) >= startDate // Check if endDate is greater than or equal to the checkDate
                // ) {
                // 	return { isInPayPeriod: true, payPeriod: payPeriod }; // The date is in a pay period
                // }
                // if (
                // 	new Date(payPeriod.startDate).setUTCHours(0, 0, 0, 0) <= endDate && // Check if startDate is less than or equal to the checkDate
                // 	new Date(payPeriod.endDate).setUTCHours(23, 59, 59, 59) >= endDate // Check if endDate is greater than or equal to the checkDate
                // ) {
                // 	return { isInPayPeriod: true, payPeriod: payPeriod }; // The date is in a pay period
                // }
            }
            return { isInPayPeriod: false }; // The date is not in any pay period
        });
    }
    isDateInEditPayPeriod(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate, companyId, id } = payPeriodData;
            const allPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId: companyId,
                    NOT: {
                        id: id,
                    },
                },
            });
            for (const payPeriod of allPayPeriods) {
                if (startDate < new Date(payPeriod.endDate).setUTCHours(23, 59, 59, 59) &&
                    endDate > new Date(payPeriod.startDate).setUTCHours(0, 0, 0, 0)) {
                    return { isInPayPeriod: true, payPeriod: payPeriod }; // The date is in a pay period
                }
            }
            return { isInPayPeriod: false };
        });
    }
    update(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, startDate, endDate } = payPeriodData;
            const payPeriod = yield prisma_1.prisma.payPeriod.update({
                where: {
                    id: id,
                },
                data: {
                    startDate: startDate,
                    endDate: endDate,
                },
                include: {
                    TimeSheets: {
                        include: {
                            timeActivities: true,
                        },
                    },
                },
            });
            return payPeriod;
        });
    }
    getDatesByPayPeriod(payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield prisma_1.prisma.payPeriod.findUnique({
                where: {
                    id: payPeriodId,
                },
            });
            const startDate = data === null || data === void 0 ? void 0 : data.startDate;
            const endDate = data === null || data === void 0 ? void 0 : data.endDate;
            return {
                startDate,
                endDate,
            };
        });
    }
}
exports.default = new PayPeriodRepository();
