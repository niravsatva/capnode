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
    getAllLogs(companyId, offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            const logs = yield prisma_1.prisma.syncLogs.findMany({
                where: {
                    companyId: companyId,
                    createdAt: {
                        gte: threeMonthsAgo,
                        lte: today,
                    },
                },
                skip: offset,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const count = yield prisma_1.prisma.syncLogs.count({
                where: {
                    companyId: companyId,
                    createdAt: {
                        gte: threeMonthsAgo,
                        lte: today,
                    },
                },
            });
            return { logs, count };
        });
    }
}
exports.default = new SyncLogRepository();
