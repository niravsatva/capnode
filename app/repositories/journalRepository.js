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
const utils_1 = require("../utils/utils");
class JournalRepository {
    getAllJournals(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, offset, limit, searchCondition, filterConditions, sortCondition, payPeriodFilter, year, } = timeSheetData;
            let startDateOfYear = new Date();
            let endDateOfYear = new Date();
            if ((0, utils_1.hasText)(year)) {
                startDateOfYear = new Date(`${Number(year)}-01-01T00:00:00.000Z`);
                endDateOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
            }
            const query = Object.assign(Object.assign(Object.assign(Object.assign({ companyId: companyId }, payPeriodFilter), searchCondition), filterConditions), { date: {
                    gte: startDateOfYear,
                    lt: endDateOfYear,
                } });
            if (!(0, utils_1.hasText)(year)) {
                delete query['date'];
            }
            const journals = yield prisma_1.prisma.journal.findMany(Object.assign(Object.assign({ where: query, skip: offset, take: limit }, sortCondition), { include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    payPeriod: true,
                } }));
            const countQuery = Object.assign(Object.assign(Object.assign(Object.assign({ companyId: companyId }, payPeriodFilter), searchCondition), filterConditions), { date: {
                    gte: startDateOfYear,
                    lt: endDateOfYear,
                } });
            if (!(0, utils_1.hasText)(year)) {
                delete countQuery['date'];
            }
            const count = yield prisma_1.prisma.journal.count({
                where: countQuery,
            });
            return { journals, count };
        });
    }
}
exports.default = new JournalRepository();
