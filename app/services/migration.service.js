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
exports.migrationService = exports.migrateTaxAndFringeSection = exports.migrateConfiguration = void 0;
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
                        permissionName: 'Pay Period',
                    },
                });
                if (!payPeriodPermissions) {
                    yield prisma_1.prisma.permission.create({
                        data: {
                            roleId: role.id,
                            permissionName: 'Pay Period',
                            all: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            view: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            edit: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            delete: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            add: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            sortId: 16,
                        },
                    });
                }
            }
        }
    });
}
function addSyncLogsPermissions() {
    return __awaiter(this, void 0, void 0, function* () {
        const allRoles = yield prisma_1.prisma.role.findMany();
        if (allRoles.length) {
            for (const role of allRoles) {
                const payPeriodPermissions = yield prisma_1.prisma.permission.findFirst({
                    where: {
                        roleId: role.id,
                        permissionName: 'Sync Logs',
                    },
                });
                if (!payPeriodPermissions) {
                    yield prisma_1.prisma.permission.create({
                        data: {
                            roleId: role.id,
                            permissionName: 'Sync Logs',
                            all: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            view: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            edit: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            delete: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            add: role.roleName === 'Admin' || role.roleName === 'Company Admin'
                                ? true
                                : false,
                            sortId: 16,
                        },
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
                indirectExpenseRate: 0,
            },
        });
    });
}
function sectionNoChanges() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma_1.prisma.configurationSection.updateMany({
            where: {
                sectionName: 'Fringe expense',
            },
            data: {
                no: 3,
            },
        });
        yield prisma_1.prisma.configurationSection.updateMany({
            where: {
                sectionName: 'Payroll Taxes Expense',
            },
            data: {
                no: 2,
            },
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
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
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
                no: 2,
            },
            select: {
                fields: {
                    where: {
                        jsonId: 'f3',
                    },
                },
                companyId: true,
                id: true,
                no: true,
                sectionName: true,
            },
        });
        if (sectionTwoConfigurationSection.length) {
            for (const section of sectionTwoConfigurationSection) {
                const sectionThree = yield prisma_1.prisma.configurationSection.findFirst({
                    where: {
                        no: 3,
                        companyId: section.companyId,
                    },
                });
                if (sectionThree) {
                    for (const field of section.fields) {
                        yield prisma_1.prisma.field.update({
                            where: {
                                id: field.id,
                            },
                            data: {
                                configurationSectionId: sectionThree === null || sectionThree === void 0 ? void 0 : sectionThree.id,
                            },
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
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
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
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
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
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
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
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
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
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
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
                closingDate: null,
            },
        });
        if (allNullClosingDatePayPeriods && allNullClosingDatePayPeriods.length) {
            for (const payPeriod of allNullClosingDatePayPeriods) {
                yield prisma_1.prisma.payPeriod.update({
                    where: {
                        id: payPeriod.id,
                    },
                    data: {
                        closingDate: (0, moment_1.default)(payPeriod.endDate)
                            .endOf('month')
                            .startOf('day')
                            .toDate(),
                    },
                });
            }
        }
    });
}
function updatePublishedJournalPayPeriods() {
    return __awaiter(this, void 0, void 0, function* () {
        const publishedJournals = yield prisma_1.prisma.journal.findMany({
            where: {
                status: 1,
            },
        });
        if (publishedJournals.length) {
            const payPeriodIds = publishedJournals.map((e) => {
                return e.payPeriodId;
            });
            yield prisma_1.prisma.payPeriod.updateMany({
                where: {
                    id: {
                        in: payPeriodIds,
                    },
                },
                data: {
                    isJournalPublished: true,
                },
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
            const sectionWithFields = yield configurationRepository_1.default.getConfigurationField(companyId, '');
            const sectionFields = sectionWithFields.reduce((accumulator, section) => {
                accumulator.push(...section.fields);
                return accumulator;
            }, []);
            yield repositories_1.employeeCostRepository.createInitialValues(employees, sectionFields, companyId);
        }
    });
}
function updateConfigurationJson() {
    return __awaiter(this, void 0, void 0, function* () {
        const allConfigurations = yield prisma_1.prisma.configuration.findMany();
        if (allConfigurations.length) {
            for (const configuration of allConfigurations) {
                const settings = configuration.settings;
                if (settings['0']) {
                    const newSettings = Object.assign({}, settings);
                    if (newSettings['0'].fields) {
                        if (newSettings['0'].fields['f1']) {
                            newSettings['0'].fields['f1'].isActive = true;
                            newSettings['0'].fields['f2'].isActive = true;
                        }
                    }
                    if (newSettings['4'].fields) {
                        if (newSettings['4'].fields['f1']) {
                            newSettings['4'].fields['f1'].isActive = true;
                        }
                    }
                    if (newSettings['5'].fields) {
                        if (newSettings['5'].fields['f1']) {
                            newSettings['5'].fields['f1'].isActive = true;
                        }
                    }
                    if (newSettings['1'].fields) {
                        Object.keys(newSettings['1'].fields).forEach((key) => {
                            newSettings['1'].fields[key].isActive = true;
                        });
                    }
                    if (newSettings['2'].fields) {
                        Object.keys(newSettings['2'].fields).forEach((key) => {
                            newSettings['2'].fields[key].isActive = true;
                        });
                    }
                    if (newSettings['3'].fields) {
                        Object.keys(newSettings['3'].fields).forEach((key) => {
                            newSettings['3'].fields[key].isActive = true;
                        });
                    }
                    yield prisma_1.prisma.configuration.update({
                        where: {
                            id: configuration.id,
                        },
                        data: {
                            settings: newSettings,
                        },
                    });
                }
            }
        }
    });
}
function migrateConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        const companies = yield prisma_1.prisma.company.findMany({
            include: {
                configuration: true
            }
        });
        if (companies.length) {
            for (const company of companies) {
                const payPeriods = yield prisma_1.prisma.payPeriod.findMany({
                    where: {
                        companyId: company.id
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                });
                if (payPeriods && payPeriods.length) {
                    const configuration = yield prisma_1.prisma.configuration.findFirst({
                        where: {
                            companyId: company.id
                        }
                    });
                    const configurationSection = yield prisma_1.prisma.configurationSection.findMany({
                        where: {
                            companyId: company.id
                        }
                    });
                    const fields = yield prisma_1.prisma.field.findMany({
                        where: {
                            companyId: company.id
                        }
                    });
                    const employeeCostFields = yield prisma_1.prisma.employeeCostField.findMany({
                        where: {
                            companyId: company.id
                        }
                    });
                    for (let i = 0; i < payPeriods.length - 1; i++) {
                        const payPeriod = payPeriods[i];
                        if (configuration) {
                            yield prisma_1.prisma.configuration.create({
                                data: {
                                    companyId: company.id,
                                    payPeriodId: payPeriod.id,
                                    settings: configuration.settings,
                                    indirectExpenseRate: configuration.indirectExpenseRate,
                                    payrollMethod: configuration.payrollMethod,
                                    decimalToFixedPercentage: configuration.decimalToFixedPercentage,
                                    decimalToFixedAmount: configuration.decimalToFixedAmount
                                }
                            });
                            for (const oldSection of configurationSection) {
                                const newSection = yield prisma_1.prisma.configurationSection.create({
                                    data: {
                                        companyId: company.id,
                                        payPeriodId: payPeriod.id,
                                        sectionName: oldSection.sectionName,
                                        no: oldSection.no,
                                    }
                                });
                                const oldFieldData = fields.filter((e) => e.configurationSectionId === oldSection.id && e.companyId === company.id);
                                if (oldFieldData.length) {
                                    for (const oldField of oldFieldData) {
                                        const newField = yield prisma_1.prisma.field.create({
                                            data: {
                                                companyId: company.id,
                                                payPeriodId: payPeriod.id,
                                                configurationSectionId: newSection.id,
                                                jsonId: oldField.jsonId,
                                                type: oldField.type,
                                                name: oldField.name,
                                                isActive: oldField.isActive
                                            }
                                        });
                                        const oldEmployeeCostFields = employeeCostFields.filter((e) => e.fieldId === oldField.id);
                                        for (const oldEmployeeCostField of oldEmployeeCostFields) {
                                            const newEmployeeCostField = yield prisma_1.prisma.employeeCostField.create({
                                                data: {
                                                    companyId: company.id,
                                                    payPeriodId: payPeriod.id,
                                                    fieldId: newField.id,
                                                    employeeId: oldEmployeeCostField.employeeId
                                                }
                                            });
                                            yield prisma_1.prisma.employeeCostValue.updateMany({
                                                where: {
                                                    payPeriodId: payPeriod.id,
                                                    employeeFieldId: oldEmployeeCostField.id
                                                },
                                                data: {
                                                    employeeFieldId: newEmployeeCostField.id
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const latestPayPeriod = payPeriods[payPeriods.length - 1];
                    if (latestPayPeriod) {
                        if (configuration) {
                            yield prisma_1.prisma.configuration.update({
                                where: {
                                    id: configuration === null || configuration === void 0 ? void 0 : configuration.id,
                                },
                                data: {
                                    payPeriodId: latestPayPeriod.id
                                }
                            });
                            for (const section of configurationSection) {
                                yield prisma_1.prisma.configurationSection.update({
                                    where: {
                                        id: section.id
                                    },
                                    data: {
                                        payPeriodId: latestPayPeriod.id
                                    }
                                });
                            }
                            for (const field of fields) {
                                yield prisma_1.prisma.field.update({
                                    where: {
                                        id: field.id
                                    },
                                    data: {
                                        payPeriodId: latestPayPeriod.id
                                    }
                                });
                            }
                            for (const employeeCostField of employeeCostFields) {
                                yield prisma_1.prisma.employeeCostField.update({
                                    where: {
                                        id: employeeCostField.id
                                    },
                                    data: {
                                        payPeriodId: latestPayPeriod.id
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    });
}
exports.migrateConfiguration = migrateConfiguration;
function migrateTaxAndFringeSection() {
    return __awaiter(this, void 0, void 0, function* () {
        const companies = yield prisma_1.prisma.company.findMany({});
        for (const company of companies) {
            const payPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId: company.id
                }
            });
            const employees = yield prisma_1.prisma.employee.findMany({
                where: {
                    companyId: company.id,
                }
            });
            for (const payPeriod of payPeriods) {
                const configuration = yield prisma_1.prisma.configuration.findFirst({
                    where: {
                        companyId: company.id,
                        payPeriodId: payPeriod.id
                    }
                });
                if (configuration && configuration.settings) {
                    const settings = configuration.settings;
                    const newConfigurationSettings = Object.assign({}, settings);
                    const configurationSections = yield prisma_1.prisma.configurationSection.findMany({
                        where: {
                            companyId: company.id,
                            no: {
                                in: [2, 3]
                            },
                            payPeriodId: payPeriod.id
                        }
                    });
                    if (configurationSections && configurationSections.length) {
                        const configurationSection2 = configurationSections.find((e) => e.no === 2);
                        const configurationSection3 = configurationSections.find((e) => e.no === 3);
                        if (configurationSection2 && configurationSection3) {
                            const configurationSection2Fields = yield prisma_1.prisma.field.findMany({
                                where: {
                                    companyId: company.id,
                                    configurationSectionId: configurationSection2.id,
                                    payPeriodId: payPeriod.id,
                                    jsonId: {
                                        not: 't1'
                                    }
                                }
                            });
                            const section2FieldsCount = configurationSection2Fields.length;
                            const configurationSection3fields = yield prisma_1.prisma.field.findMany({
                                where: {
                                    companyId: company.id,
                                    configurationSectionId: configurationSection3.id,
                                    payPeriodId: payPeriod.id,
                                    jsonId: {
                                        not: 't1'
                                    }
                                },
                                orderBy: {
                                    jsonId: 'asc'
                                }
                            });
                            let section2FieldsCountIncrement = section2FieldsCount;
                            for (const section3Field of configurationSection3fields) {
                                section2FieldsCountIncrement = section2FieldsCountIncrement + 1;
                                yield prisma_1.prisma.field.update({
                                    where: {
                                        id: section3Field.id
                                    },
                                    data: {
                                        jsonId: `f${section2FieldsCountIncrement}`,
                                        configurationSectionId: configurationSection2.id
                                    }
                                });
                                newConfigurationSettings['2'].fields[`f${section2FieldsCountIncrement}`] = newConfigurationSettings['2'].fields[section3Field.jsonId];
                            }
                            newConfigurationSettings['2'].capMappingTitle = 'Payroll Taxes & Fringe Benefits';
                            newConfigurationSettings['2'].placeHolder = 'Select Payroll Taxes & Fringe Expense';
                            newConfigurationSettings['2'].errorMessage = 'Please Select Payroll Taxes & Fringe Expense';
                            newConfigurationSettings['2'].toolTip = 'Payroll Taxes & Fringe Benefits: These are the Payroll expense accounts or Fringe Benefits, if the user add new account here, it will be added as new column in Cost allocation';
                            yield prisma_1.prisma.field.updateMany({
                                where: {
                                    configurationSectionId: configurationSection3.id,
                                    companyId: company.id,
                                    payPeriodId: payPeriod.id,
                                    jsonId: 't1'
                                },
                                data: {
                                    isActive: false,
                                    name: 'Total Other Expanses'
                                }
                            });
                            yield prisma_1.prisma.field.updateMany({
                                where: {
                                    configurationSectionId: configurationSection2.id,
                                    companyId: company.id,
                                    payPeriodId: payPeriod.id,
                                    jsonId: 't1'
                                },
                                data: {
                                    name: 'Total Payroll Taxes & Fringe Benefits'
                                }
                            });
                            newConfigurationSettings['3'].fields = {};
                            newConfigurationSettings['3'].capMappingTitle = 'Other Expenses';
                            newConfigurationSettings['3'].placeHolder = 'Select Other Expenses';
                            newConfigurationSettings['3'].errorMessage = 'Please Select Other Expenses';
                            newConfigurationSettings['3'].toolTip = 'Other Expense Accounts:  These are the Other expense accounts, if the user add a new account here, it will be added as new columns in Cost allocation';
                            for (const employee of employees) {
                                const employeeTotalField = yield prisma_1.prisma.employeeCostField.findFirst({
                                    where: {
                                        field: {
                                            configurationSectionId: configurationSection2.id,
                                            jsonId: 't1',
                                            payPeriodId: payPeriod.id
                                        },
                                        employeeId: employee.id,
                                        payPeriodId: payPeriod.id
                                    }
                                });
                                const allSection2Fields = yield prisma_1.prisma.employeeCostField.findMany({
                                    where: {
                                        field: {
                                            configurationSectionId: configurationSection2.id,
                                            jsonId: {
                                                not: 't1'
                                            },
                                            isActive: true,
                                            payPeriodId: payPeriod.id
                                        },
                                        employeeId: employee.id,
                                        payPeriodId: payPeriod.id
                                    }
                                });
                                const employeeCostValue = yield prisma_1.prisma.employeeCostValue.findMany({
                                    where: {
                                        employeeFieldId: {
                                            in: allSection2Fields.map((e) => { return e.id; })
                                        },
                                        payPeriodId: payPeriod.id
                                    }
                                });
                                let total = 0;
                                employeeCostValue.forEach((empValue) => {
                                    total = total + Number(empValue.value);
                                });
                                total = Number(total.toFixed(configuration.decimalToFixedAmount || 2));
                                if (employeeTotalField) {
                                    yield prisma_1.prisma.employeeCostValue.updateMany({
                                        where: {
                                            employeeFieldId: employeeTotalField === null || employeeTotalField === void 0 ? void 0 : employeeTotalField.id,
                                            employeeId: employee.id,
                                            payPeriodId: payPeriod.id
                                        },
                                        data: {
                                            value: String(total)
                                        }
                                    });
                                }
                            }
                        }
                    }
                    yield prisma_1.prisma.configuration.update({
                        where: {
                            id: configuration.id
                        },
                        data: {
                            settings: newConfigurationSettings
                        }
                    });
                }
            }
        }
    });
}
exports.migrateTaxAndFringeSection = migrateTaxAndFringeSection;
exports.migrationService = {
    migrateTaxAndFringeSection,
    migrateConfiguration,
    addSyncLogsPermissions,
    updateConfigurationJson,
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
