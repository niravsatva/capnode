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
class JournalRepository {
    getAllJournals(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, offset, limit, searchCondition, filterConditions, sortCondition, payPeriodFilter, } = timeSheetData;
            const journals = yield prisma_1.prisma.journal.findMany(Object.assign(Object.assign({ where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, payPeriodFilter), searchCondition), filterConditions), skip: offset, take: limit }, sortCondition), { include: {
                    createdBy: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                } }));
            const count = yield prisma_1.prisma.journal.count({
                where: Object.assign(Object.assign(Object.assign({ companyId: companyId }, payPeriodFilter), searchCondition), filterConditions)
            });
            return { journals, count };
        });
    }
}
exports.default = new JournalRepository();
