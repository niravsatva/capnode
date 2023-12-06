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
/* eslint-disable @typescript-eslint/no-unused-vars */
const prisma_1 = require("../client/prisma");
class EmployeeCostRepository {
    // For get the monthly cost value per employee
    getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition, isPercentage, payPeriodId, includeInactive) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereQuery = Object.assign({ companyId: companyId, active: true }, searchCondition);
                if (includeInactive) {
                    delete whereQuery['active'];
                }
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: whereQuery, include: {
                        employeeCostField: {
                            where: {
                                field: {
                                    payPeriodId,
                                    isActive: true,
                                },
                                payPeriodId
                            },
                            include: {
                                field: true,
                                costValue: {
                                    where: {
                                        payPeriodId,
                                        isPercentage: true,
                                    },
                                },
                            },
                        },
                    }, skip: offset, take: limit }, sortCondition));
                return employeesCostByMonth;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getMonthlyCostTotal(companyId, payPeriodId, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                companyId,
                fullName: {
                    contains: search,
                    mode: 'insensitive',
                },
            };
            if (!search) {
                delete query.fullName;
            }
            const employeesCostByMonth = yield prisma_1.prisma.employee.findMany({
                where: query,
                include: {
                    employeeCostField: {
                        where: {
                            field: {
                                payPeriodId,
                                isActive: true,
                            },
                            payPeriodId
                        },
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId,
                                    isPercentage: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    fullName: 'asc',
                },
            });
            return employeesCostByMonth;
        });
    }
    getEmployees(companyId, offset, limit, searchCondition, sortCondition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const dateCopy = new Date(date);
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: Object.assign({ companyId: companyId }, searchCondition), skip: offset, take: limit }, sortCondition));
                return employeesCostByMonth;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getMonthlyCostExport(companyId, date, searchCondition, sortCondition, isPercentage, includeInactive, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isPercentageValue = isPercentage || true;
            const whereQuery = Object.assign({ companyId: companyId, active: true }, searchCondition);
            if (includeInactive) {
                delete whereQuery['active'];
            }
            try {
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: whereQuery, include: {
                        employeeCostField: {
                            where: {
                                field: {
                                    payPeriodId,
                                    companyId,
                                    isActive: true,
                                    configurationSection: {
                                        payPeriodId,
                                        companyId
                                    }
                                },
                                payPeriodId
                            },
                            include: {
                                field: {
                                    include: {
                                        configurationSection: true,
                                    },
                                },
                                costValue: {
                                    where: {
                                        payPeriodId: payPeriodId,
                                        isPercentage: isPercentageValue,
                                    },
                                },
                            },
                        },
                    } }, sortCondition));
                return employeesCostByMonth;
            }
            catch (error) {
                throw error;
            }
        });
    }
    count(companyId, searchCondition, includeInactive) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereQuery = Object.assign({ companyId: companyId, active: true }, searchCondition);
                if (includeInactive) {
                    delete whereQuery['active'];
                }
                const employeeCount = yield prisma_1.prisma.employee.count({
                    where: whereQuery,
                });
                return employeeCount;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // Create monthly cost values for all employees
    createMonthlyCost(employees, companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastPayPeriodId = null;
            const allPayPeriods = yield prisma_1.prisma.payPeriod.findMany({
                where: {
                    companyId,
                    id: {
                        not: payPeriodId,
                    },
                },
            });
            if (allPayPeriods && allPayPeriods.length) {
                lastPayPeriodId = allPayPeriods[allPayPeriods.length - 1].id;
            }
            yield Promise.all(employees.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                // Fetching all the fields of that employee
                const employeeCostFields = yield prisma_1.prisma.employeeCostField.findMany({
                    where: {
                        companyId: companyId,
                        employeeId: singleEmployee.id,
                        payPeriodId
                    },
                    select: {
                        id: true,
                        employee: true,
                        employeeId: true,
                        company: true,
                        companyId: true,
                        fieldId: true,
                        field: {
                            select: {
                                jsonId: true,
                                configurationSection: {
                                    select: {
                                        no: true,
                                    },
                                },
                            },
                        },
                    },
                });
                // Creating the values for single employee - For Percentage Method
                employeeCostFields.map((singleEmployeeCostFields) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    if (((_b = (_a = singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.field) === null || _a === void 0 ? void 0 : _a.configurationSection) === null || _b === void 0 ? void 0 : _b.no) == 0) {
                        if (((_c = singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.field) === null || _c === void 0 ? void 0 : _c.jsonId) == 'f1') {
                            yield prisma_1.prisma.employeeCostValue.create({
                                data: {
                                    employee: { connect: { id: singleEmployee.id } },
                                    employeeCostField: {
                                        connect: { id: singleEmployeeCostFields.id },
                                    },
                                    payPeriod: { connect: { id: payPeriodId } },
                                    value: null,
                                    isPercentage: true,
                                },
                            });
                        }
                        else {
                            yield prisma_1.prisma.employeeCostValue.create({
                                data: {
                                    employee: { connect: { id: singleEmployee.id } },
                                    employeeCostField: {
                                        connect: { id: singleEmployeeCostFields.id },
                                    },
                                    payPeriod: { connect: { id: payPeriodId } },
                                    value: '0:00',
                                    isPercentage: true,
                                },
                            });
                        }
                    }
                    else {
                        let value = '0.00';
                        if (lastPayPeriodId) {
                            const lastPayPeriodValue = yield prisma_1.prisma.employeeCostValue.findFirst({
                                where: {
                                    employeeCostField: {
                                        id: singleEmployeeCostFields.id,
                                        companyId,
                                    },
                                    employeeId: singleEmployee.id,
                                    payPeriodId: lastPayPeriodId,
                                },
                            });
                            if (lastPayPeriodValue) {
                                value = lastPayPeriodValue.value;
                            }
                        }
                        yield prisma_1.prisma.employeeCostValue.create({
                            data: {
                                employee: { connect: { id: singleEmployee.id } },
                                employeeCostField: {
                                    connect: { id: singleEmployeeCostFields.id },
                                },
                                payPeriod: { connect: { id: payPeriodId } },
                                isPercentage: true,
                                value,
                            },
                        });
                    }
                }));
            })));
            return 'Percentage values created successfully';
        });
    }
    // Creating employee cost fields at integration time
    createInitialValues(listOfEmployee, listOfFields, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all(listOfEmployee.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    listOfFields.map((singleField) => __awaiter(this, void 0, void 0, function* () {
                        yield prisma_1.prisma.employeeCostField.create({
                            data: {
                                employee: { connect: { id: singleEmployee.id } },
                                field: { connect: { id: singleField.id } },
                                company: { connect: { id: companyId } },
                            },
                        });
                    }));
                })));
                return 'Initial values created';
            }
            catch (error) {
                throw error;
            }
        });
    }
    // Create EmployeeCost when new field create
    createNewEmployeeCost(listOfEmployee, fieldId, companyId, listOfPayPeriods) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all(listOfEmployee.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    //creating employee field
                    const employeeCostField = yield prisma_1.prisma.employeeCostField.create({
                        data: {
                            employee: { connect: { id: singleEmployee.id } },
                            field: { connect: { id: fieldId } },
                            company: { connect: { id: companyId } },
                        },
                    });
                    // creating the employee cost field value - percentage
                    yield Promise.all(listOfPayPeriods.map((singlePayPeriod) => __awaiter(this, void 0, void 0, function* () {
                        yield prisma_1.prisma.employeeCostValue.create({
                            data: {
                                employee: { connect: { id: singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.id } },
                                employeeCostField: {
                                    connect: { id: employeeCostField === null || employeeCostField === void 0 ? void 0 : employeeCostField.id },
                                },
                                payPeriod: { connect: { id: singlePayPeriod === null || singlePayPeriod === void 0 ? void 0 : singlePayPeriod.id } },
                                isPercentage: true,
                            },
                        });
                    })));
                })));
                return 'Initial values created';
            }
            catch (error) {
                throw error;
            }
        });
    }
    createNewEmployeeCostAndField(listOfEmployees, fieldId, companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!listOfEmployees.length) {
                return;
            }
            for (const employee of listOfEmployees) {
                const employeeCostField = yield prisma_1.prisma.employeeCostField.create({
                    data: {
                        companyId,
                        payPeriodId: payPeriodId,
                        fieldId: fieldId,
                        employeeId: employee.id
                    }
                });
                yield prisma_1.prisma.employeeCostValue.create({
                    data: {
                        employeeId: employee.id,
                        employeeFieldId: employeeCostField.id,
                        payPeriodId: payPeriodId,
                        isPercentage: true,
                        value: '0.00',
                    },
                });
            }
        });
    }
    // delete EmployeeCost when new field delete
    deleteNewEmployeeCost(listOfEmployee, fieldId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all(listOfEmployee.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma_1.prisma.employeeCostField.deleteMany({
                        where: {
                            employeeId: singleEmployee.id,
                            fieldId: fieldId,
                            companyId: companyId,
                        },
                    });
                })));
                return 'Initial values created';
            }
            catch (error) {
                throw error;
            }
        });
    }
    // Create EmployeeCost Value when new field create
    createNewMonthlyCost(employees, employeeCostFieldId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                // For hours
                yield Promise.all(employees.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma_1.prisma.employeeCostValue.create({
                        data: {
                            employee: { connect: { id: singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.id } },
                            employeeCostField: {
                                connect: { id: employeeCostFieldId },
                            },
                            // month: dateCopy.getMonth() + 1,
                            // year: dateCopy.getFullYear(),
                            isPercentage: false,
                        },
                    });
                })));
                // For percentage
                yield Promise.all(employees.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma_1.prisma.employeeCostValue.create({
                        data: {
                            employee: { connect: { id: singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.id } },
                            employeeCostField: {
                                connect: { id: employeeCostFieldId },
                            },
                            isPercentage: true,
                        },
                    });
                })));
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For update the monthly cost value
    updateMonthlyCost(employeeCostValueID, value, payPeriodId, isCalculatorValue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCost = yield prisma_1.prisma.employeeCostValue.update({
                    where: {
                        id: employeeCostValueID,
                    },
                    data: {
                        value: value,
                    },
                });
                return updatedCost;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new EmployeeCostRepository();
