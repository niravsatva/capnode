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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationService = void 0;
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../client/prisma");
const logger_1 = require("../utils/logger");
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
const repositories_1 = require("../repositories");
const data_1 = require("../constants/data");
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
        logger_1.logger.info('running');
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
function configurationFringeExpenseChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (settings['3']) {
                    const newSettings = Object.assign({}, settings);
                    if (newSettings['3'].fields) {
                        if (newSettings['3'].fields['f2']) {
                            newSettings['3'].fields['f2'].deletable = true;
                        }
                    }
                    if (newSettings['3'].fields) {
                        if (newSettings['3'].fields['f3']) {
                            newSettings['3'].fields['f3'].deletable = true;
                        }
                    }
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
function configurationPayRollExpenseChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (settings['2']) {
                    const newSettings = Object.assign({}, settings);
                    if (newSettings['2'].fields) {
                        if (newSettings['2'].fields['f2']) {
                            newSettings['2'].fields['f2'].deletable = true;
                        }
                    }
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
function configurationPayRollExpenseLabelChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (settings['2']) {
                    const newSettings = Object.assign({}, settings);
                    if (newSettings['2'].capMappingTitle) {
                        newSettings['2'].capMappingTitle = 'Payroll Tax Expense';
                    }
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
function configurationSalarySectionChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (settings['1']) {
                    const newSettings = Object.assign({}, settings);
                    if (newSettings['1'].fields) {
                        if (newSettings['1'].fields['f2']) {
                            newSettings['1'].fields['f2'].deletable = true;
                        }
                    }
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
function configurationFirstSectionChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (settings['1']) {
                    const newSettings = Object.assign({}, settings);
                    if (newSettings['0'].fields) {
                        if (newSettings['0'].fields['f1']) {
                            newSettings['0'].fields['f1'].label = 'Payroll Expense Pool';
                        }
                    }
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
function addClosingDateToPayPeriod() {
    return __awaiter(this, void 0, void 0, function* () {
        const allNullClosingDatePayPeriods = yield prisma_1.prisma.payPeriod.findMany({
            where: {
                closingDate: null
            }
        });
        if (allNullClosingDatePayPeriods && allNullClosingDatePayPeriods.length) {
            for (const payPeriod of allNullClosingDatePayPeriods) {
                yield prisma_1.prisma.payPeriod.update({
                    where: {
                        id: payPeriod.id
                    },
                    data: {
                        closingDate: (0, moment_1.default)(payPeriod.endDate).endOf('month').startOf('day').toDate()
                    }
                });
            }
        }
    });
}
function updatePublishedJournalPayPeriods() {
    return __awaiter(this, void 0, void 0, function* () {
        const publishedJournals = yield prisma_1.prisma.journal.findMany({
            where: {
                status: 1
            }
        });
        if (publishedJournals.length) {
            const payPeriodIds = publishedJournals.map((e) => {
                return e.payPeriodId;
            });
            yield prisma_1.prisma.payPeriod.updateMany({
                where: {
                    id: {
                        in: payPeriodIds
                    }
                },
                data: {
                    isJournalPublished: true
                }
            });
        }
    });
}
function syncMissingField() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.RUN_SYNC_FIELD_MIGRATION === 'true') {
            const companyId = '4f4155a3-b6c3-4410-8857-6bbf18cd4dd8';
            yield Promise.all(data_1.sectionPreLive.map((singleSection) => __awaiter(this, void 0, void 0, function* () {
                const section = yield prisma_1.prisma.configurationSection.create({
                    data: {
                        sectionName: singleSection.sectionName,
                        no: singleSection.no,
                        company: { connect: { id: companyId } },
                    },
                });
                yield Promise.all(singleSection.fields.map((singleField) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma_1.prisma.field.create({
                        data: {
                            jsonId: singleField.jsonId,
                            name: singleField.name,
                            type: singleField.type,
                            company: { connect: { id: companyId } },
                            configurationSection: { connect: { id: section.id } },
                        },
                    });
                })));
            })));
            const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
            const sectionWithFields = yield configurationRepository_1.default.getConfigurationField(companyId);
            const sectionFields = sectionWithFields.reduce((accumulator, section) => {
                accumulator.push(...section.fields);
                return accumulator;
            }, []);
            yield repositories_1.employeeCostRepository.createInitialValues(employees, sectionFields, companyId);
        }
    });
}
exports.migrationService = {
    syncMissingField,
    updatePublishedJournalPayPeriods,
    addClosingDateToPayPeriod,
    configurationFirstSectionChanges,
    configurationSalarySectionChanges,
    configurationPayRollExpenseLabelChanges,
    configurationPayRollExpenseChanges,
    configurationFringeExpenseChanges,
    fieldChanges,
    configurationSettingChanges,
    sectionNoChanges,
    defaultIndirectExpenseRate,
    addPayRolePermissions,
    testFun,
};
