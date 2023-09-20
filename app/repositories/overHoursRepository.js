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
class OverHourRepository {
    getOverHoursByYear(companyId, employeeId, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourOverDetails = yield prisma_1.prisma.hoursOver.findFirst({
                where: {
                    employeeId: employeeId,
                    companyId: companyId,
                    year: Number(year),
                },
            });
            return hourOverDetails;
        });
    }
    createOverHoursByYear(companyId, employeeId, year) {
        return __awaiter(this, void 0, void 0, function* () {
            const overHours = yield prisma_1.prisma.hoursOver.create({
                data: {
                    company: { connect: { id: companyId } },
                    employee: { connect: { id: employeeId } },
                    year: year,
                },
            });
            return overHours;
        });
    }
    updateOverHoursByYear(companyId, employeeId, year, overHours, overMinutes, isOver) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield prisma_1.prisma.hoursOver.updateMany({
                where: {
                    companyId: companyId,
                    employeeId: employeeId,
                    year: year,
                },
                data: {
                    isOverHours: isOver,
                    overHours: overHours,
                    overMinutes: overMinutes,
                },
            });
            return updated;
        });
    }
}
exports.default = new OverHourRepository();
