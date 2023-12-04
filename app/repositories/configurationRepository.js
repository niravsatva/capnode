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
/* eslint-disable camelcase */
const prisma_1 = require("../client/prisma");
const data_1 = require("../constants/data");
const employeeCostRepository_1 = __importDefault(require("./employeeCostRepository"));
const payPeriodRepository_1 = __importDefault(require("./payPeriodRepository"));
class ConfigurationRepository {
    // Create default configuration settings for the first time company is created
    createDefaultConfiguration(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configuration = yield prisma_1.prisma.configuration.create({
                    data: {
                        settings: data_1.DefaultConfigurationSettings,
                        indirectExpenseRate: 0,
                        payrollMethod: 'Percentage',
                        companyId: companyId
                    },
                });
                return configuration;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get company configurations
    getCompanyConfiguration(companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configuration = yield prisma_1.prisma.configuration.findFirst({
                    where: {
                        companyId: companyId,
                        payPeriodId: payPeriodId
                    },
                });
                return configuration;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update configuration settings
    updateConfiguration(companyId, payPeriodId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedConfiguration = yield prisma_1.prisma.configuration.update({
                    where: {
                        companyId_payPeriodId: {
                            companyId: companyId,
                            payPeriodId: payPeriodId
                        }
                    },
                    data: data,
                });
                const settings = data.settings;
                const configurationSectionData = yield prisma_1.prisma.configurationSection.findMany({
                    where: {
                        companyId,
                        payPeriodId
                    },
                    select: {
                        id: true,
                        no: true
                    }
                });
                for (const key in settings) {
                    const section = configurationSectionData.find((e) => e.no === Number(key));
                    for (const fieldKey in settings[key].fields) {
                        if (section) {
                            const fieldData = settings[key].fields[fieldKey];
                            if (fieldData && section) {
                                yield prisma_1.prisma.field.updateMany({
                                    where: {
                                        companyId,
                                        payPeriodId,
                                        jsonId: fieldKey,
                                        configurationSectionId: section.id,
                                    },
                                    data: {
                                        name: fieldData.label,
                                        isActive: fieldData.isActive
                                    }
                                });
                            }
                        }
                    }
                }
                // const listOfPeriod = await payPeriodRepository.getAll({
                // 	companyId,
                // 	dateFilter: {},
                // });
                const configurationFields = yield this.getConfigurationField(companyId, payPeriodId);
                const monthlyCost = yield employeeCostRepository_1.default.getMonthlyCost(companyId, '', 0, 10000000, {}, {}, true, payPeriodId);
                yield Promise.all(monthlyCost.map((singleEmployeeData) => {
                    configurationFields.map((singleConfigurationSection) => __awaiter(this, void 0, void 0, function* () {
                        if (singleConfigurationSection.no !== 0) {
                            let total = 0;
                            singleEmployeeData.employeeCostField.forEach((singleEmployeeCostField) => {
                                if (singleEmployeeCostField.field
                                    .configurationSectionId ===
                                    singleConfigurationSection.id &&
                                    singleEmployeeCostField.field.jsonId !== 't1') {
                                    total += Number(singleEmployeeCostField.costValue[0].value);
                                }
                            });
                            const fieldToUpdate = singleEmployeeData.employeeCostField.find((singleEmployeeCostField) => singleEmployeeCostField.field
                                .configurationSectionId ===
                                singleConfigurationSection.id &&
                                singleEmployeeCostField.field.jsonId === 't1');
                            yield employeeCostRepository_1.default.updateMonthlyCost(fieldToUpdate.costValue[0].id, total.toFixed(2));
                        }
                    }));
                })
                // listOfPeriod.map(async (singlePayPeriod: any) => {
                // })
                );
                return updatedConfiguration;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getConfigurationField(companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configurationSection = yield prisma_1.prisma.configurationSection.findMany({
                    where: {
                        companyId,
                        payPeriodId,
                    },
                    orderBy: {
                        no: 'asc',
                    },
                    include: {
                        fields: {
                            orderBy: {
                                jsonId: 'asc',
                            },
                        },
                    },
                });
                return configurationSection;
            }
            catch (err) {
                throw err;
            }
        });
    }
    createField(companyId, sectionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const createdField = yield prisma_1.prisma.field.create({
                    data: Object.assign({ company: { connect: { id: companyId } }, configurationSection: { connect: { id: sectionId } } }, data),
                });
                return createdField;
            }
            catch (err) {
                throw err;
            }
        });
    }
    deleteConfigurationField(fieldId, companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedField = yield prisma_1.prisma.field.delete({
                    where: {
                        id: fieldId,
                    },
                });
                const percentAndHourArray = [true, false];
                const listOfPeriod = yield payPeriodRepository_1.default.getAll({
                    companyId,
                    dateFilter: {},
                });
                yield Promise.all(percentAndHourArray.map(() => __awaiter(this, void 0, void 0, function* () {
                    yield Promise.all(listOfPeriod.map((singlePayPeriod) => __awaiter(this, void 0, void 0, function* () {
                        const configurationFields = yield this.getConfigurationField(companyId, payPeriodId);
                        const monthlyCost = yield employeeCostRepository_1.default.getMonthlyCost(companyId, '', 0, 10000000, {}, {}, true, singlePayPeriod.id);
                        monthlyCost.map((singleEmployeeData) => {
                            configurationFields.map((singleConfigurationSection) => __awaiter(this, void 0, void 0, function* () {
                                if (singleConfigurationSection.no !== 0) {
                                    let total = 0;
                                    singleEmployeeData.employeeCostField.forEach((singleEmployeeCostField) => {
                                        if (singleEmployeeCostField.field
                                            .configurationSectionId ===
                                            singleConfigurationSection.id &&
                                            singleEmployeeCostField.field.jsonId !== 't1') {
                                            total += Number(singleEmployeeCostField.costValue[0].value);
                                        }
                                    });
                                    const fieldToUpdate = singleEmployeeData.employeeCostField.find((singleEmployeeCostField) => singleEmployeeCostField.field
                                        .configurationSectionId ===
                                        singleConfigurationSection.id &&
                                        singleEmployeeCostField.field.jsonId === 't1');
                                    yield employeeCostRepository_1.default.updateMonthlyCost(fieldToUpdate.costValue[0].id, total.toFixed(2));
                                }
                            }));
                        });
                    })));
                })));
                return deletedField;
            }
            catch (err) {
                throw err;
            }
        });
    }
    editConfigurationField(fieldId, fieldName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedField = yield prisma_1.prisma.field.update({
                    where: {
                        id: fieldId,
                    },
                    data: {
                        name: fieldName,
                    },
                });
                return updatedField;
            }
            catch (err) {
                throw err;
            }
        });
    }
    initialFieldSectionCreate(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all(data_1.sections.map((singleSection) => __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new ConfigurationRepository();
