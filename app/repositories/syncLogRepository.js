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
class SyncLogRepository {
    getAllLogs(companyId, offset, limit, filterConditions, dateFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Date : ', dateFilter);
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            const logs = yield prisma_1.prisma.syncLogs.findMany({
                where: Object.assign(Object.assign({ companyId: companyId }, filterConditions), dateFilter),
                skip: offset,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const count = yield prisma_1.prisma.syncLogs.count({
                where: Object.assign(Object.assign(Object.assign({}, dateFilter), filterConditions), { companyId: companyId }),
            });
            return { logs, count };
        });
    }
}
exports.default = new SyncLogRepository();
