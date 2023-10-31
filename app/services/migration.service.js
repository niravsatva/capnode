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
function configurationSettingChanges() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (((_a = settings['2']) === null || _a === void 0 ? void 0 : _a.placeHolder) === 'Select Fringe Expense') {
                    const newSettings = Object.assign({}, settings);
                    newSettings['2'] = Object.assign(Object.assign({}, settings['3']), { id: '2' });
                    newSettings['3'] = Object.assign(Object.assign({}, settings['2']), { id: '3' });
                    yield prisma_1.prisma.configuration.update({
                        where: {
                            id: configuration.id
                        },
                        data: {
                            settings: newSettings
                        }
                    });
                }
            }
        }
    });
}
function fieldChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        const sectionTwoConfigurationSection = yield prisma_1.prisma.configurationSection.findMany({
            where: {
                no: 2
            },
            select: {
                fields: {
                    where: {
                        jsonId: 'f3'
                    }
                },
                companyId: true,
                id: true,
                no: true,
                sectionName: true
            }
        });
        if (sectionTwoConfigurationSection.length) {
            for (const section of sectionTwoConfigurationSection) {
                const sectionThree = yield prisma_1.prisma.configurationSection.findFirst({
                    where: {
                        no: 3,
                        companyId: section.companyId
                    }
                });
                if (sectionThree) {
                    for (const field of section.fields) {
                        yield prisma_1.prisma.field.update({
                            where: {
                                id: field.id
                            },
                            data: {
                                configurationSectionId: sectionThree === null || sectionThree === void 0 ? void 0 : sectionThree.id
                            }
                        });
                    }
                }
            }
        }
    });
}
exports.migrationService = {
    fieldChanges,
    configurationSettingChanges,
    sectionNoChanges,
    defaultIndirectExpenseRate,
    addPayRolePermissions,
    testFun,
};
