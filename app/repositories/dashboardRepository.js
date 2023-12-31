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
class DashboardRepository {
    getSalaryExpenseByMonth(companyId, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = new Date().getFullYear();
            const journals = yield prisma_1.prisma.journal.findMany({
                where: {
                    companyId: companyId,
                    date: {
                        gte: new Date(`${year ? year : currentYear}-01-01T00:00:00.000Z`),
                        lte: new Date(`${year ? year : currentYear}-12-31T23:59:59.999Z`),
                    },
                },
                orderBy: {
                    date: 'asc',
                },
            });
            return journals;
        });
    }
}
exports.default = new DashboardRepository();
