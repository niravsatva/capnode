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
class PayPeriodRepository {
    getAll(payPeriodData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, dateFilter, offset, limit } = payPeriodData;
            const query = {
                where: Object.assign({ companyId: companyId }, dateFilter),
                skip: offset,
                take: limit
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
    getDetails(payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payPeriodDetails = yield prisma_1.prisma.payPeriod.findUnique({
                where: {
                    id: payPeriodId,
                },
            });
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
            const { startDate, endDate } = payPeriodData;
            const allPayPeriods = yield prisma_1.prisma.payPeriod.findMany();
            for (const payPeriod of allPayPeriods) {
                if (payPeriod.startDate <= startDate && // Check if startDate is less than or equal to the checkDate
                    payPeriod.endDate >= startDate // Check if endDate is greater than or equal to the checkDate
                ) {
                    return { isInPayPeriod: true, payPeriod: payPeriod }; // The date is in a pay period
                }
            }
            for (const payPeriod of allPayPeriods) {
                if (payPeriod.startDate <= endDate && // Check if startDate is less than or equal to the checkDate
                    payPeriod.endDate >= endDate // Check if endDate is greater than or equal to the checkDate
                ) {
                    return { isInPayPeriod: true, payPeriod: payPeriod }; // The date is in a pay period
                }
            }
            return { isInPayPeriod: false }; // The date is not in any pay period
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
            });
            return payPeriod;
        });
    }
}
exports.default = new PayPeriodRepository();
