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
class DeveloperService {
    deleteCompanyFromDb(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyRoles = yield prisma_1.prisma.companyRole.findMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.role.deleteMany({
                where: {
                    id: {
                        in: companyRoles.map((e) => {
                            return e.roleId;
                        })
                    }
                }
            });
            yield prisma_1.prisma.user.deleteMany({
                where: {
                    id: {
                        in: companyRoles.map((e) => {
                            return e.userId;
                        })
                    }
                }
            });
            yield prisma_1.prisma.companyRole.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.timeActivities.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.timeSheets.deleteMany({
                where: {
                    companyId
                }
            });
            const getEmployeeCostField = yield prisma_1.prisma.employeeCostField.findMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.employeeCostValue.deleteMany({
                where: {
                    employeeFieldId: {
                        in: getEmployeeCostField.map((e) => {
                            return e.id;
                        })
                    }
                }
            });
            yield prisma_1.prisma.employeeCostField.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.field.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.configurationSection.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.configuration.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.journal.deleteMany({
                where: {
                    companyId
                }
            });
            yield prisma_1.prisma.payPeriod.deleteMany({
                where: {
                    companyId
                }
            });
        });
    }
}
exports.default = new DeveloperService();
