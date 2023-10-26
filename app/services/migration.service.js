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
exports.migrationService = void 0;
const prisma_1 = require("../client/prisma");
function addPayRolePermissions() {
    return __awaiter(this, void 0, void 0, function* () {
        const allRoles = yield prisma_1.prisma.role.findMany();
        if (allRoles.length) {
            for (const role of allRoles) {
                const payPeriodPermissions = yield prisma_1.prisma.permission.findFirst({
                    where: {
                        roleId: role.id,
                        permissionName: 'Pay Period'
                    }
                });
                if (!payPeriodPermissions) {
                    yield prisma_1.prisma.permission.create({
                        data: {
                            roleId: role.id,
                            permissionName: 'Pay Period',
                            all: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                            view: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                            edit: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                            delete: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                            add: (role.roleName === 'Admin' || role.roleName === 'Company Admin') ? true : false,
                            sortId: 16,
                        }
                    });
                }
            }
        }
    });
}
function testFun() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('running');
    });
}
function defaultIndirectExpenseRate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma_1.prisma.configuration.updateMany({
            data: {
                indirectExpenseRate: 0
            }
        });
    });
}
function sectionNoChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma_1.prisma.configurationSection.updateMany({
            where: {
                sectionName: 'Fringe expense'
            },
            data: {
                no: 3
            }
        });
        yield prisma_1.prisma.configurationSection.updateMany({
            where: {
                sectionName: 'Payroll Taxes Expense'
            },
            data: {
                no: 2
            }
        });
    });
}
exports.migrationService = {
    sectionNoChanges,
    defaultIndirectExpenseRate,
    addPayRolePermissions,
    testFun
};
