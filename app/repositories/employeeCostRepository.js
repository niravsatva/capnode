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
const customError_1 = require("../models/customError");
class EmployeeCostRepository {
    // For get the monthly cost value per employee
    getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition, isPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: Object.assign({ companyId: companyId }, searchCondition), include: {
                        employeeCostField: {
                            include: {
                                field: true,
                                costValue: {
                                    where: {
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
                                        isPercentage: isPercentage,
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
    getMonthlyCostExport(companyId, date, searchCondition, sortCondition, isPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            const isPercentageValue = isPercentage || false;
            try {
                const dateCopy = new Date(date);
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: Object.assign({ companyId: companyId }, searchCondition), include: {
                        employeeCostField: {
                            include: {
                                field: {
                                    include: {
                                        configurationSection: true,
                                    },
                                },
                                costValue: {
                                    where: {
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
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
    count(companyId, searchCondition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeCount = yield prisma_1.prisma.employee.count({
                    where: Object.assign({ companyId: companyId }, searchCondition),
                });
                return employeeCount;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For create the monthly values
    createMonthlyCost(employees, companyId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                const monthArr = yield prisma_1.prisma.monthYearTable.findMany({
                    where: {
                        year: dateCopy.getFullYear(),
                        companyId: companyId,
                    },
                    orderBy: {
                        month: 'desc',
                    },
                });
                yield Promise.all(employees.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    // Fetching all the fields of that employee
                    const employeeCostFields = yield prisma_1.prisma.employeeCostField.findMany({
                        where: {
                            companyId: companyId,
                            employeeId: singleEmployee.id,
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
                    // Creating the values for single employee - For Hourly Method
                    employeeCostFields.map((singleEmployeeCostFields) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c;
                        if (((_b = (_a = singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.field) === null || _a === void 0 ? void 0 : _a.configurationSection) === null || _b === void 0 ? void 0 : _b.no) == 0) {
                            if (((_c = singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.field) === null || _c === void 0 ? void 0 : _c.jsonId) == 'f1') {
                                // Employee Type field
                                if (monthArr && monthArr.length > 1) {
                                    const findEmployee = yield prisma_1.prisma.employeeCostValue.findFirst({
                                        where: {
                                            month: monthArr[1].month,
                                            year: dateCopy.getFullYear(),
                                            isPercentage: false,
                                            employeeFieldId: singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.id,
                                        },
                                    });
                                    yield prisma_1.prisma.employeeCostValue.create({
                                        data: {
                                            employee: { connect: { id: singleEmployee.id } },
                                            employeeCostField: {
                                                connect: { id: singleEmployeeCostFields.id },
                                            },
                                            month: dateCopy.getMonth() + 1,
                                            year: dateCopy.getFullYear(),
                                            value: (findEmployee === null || findEmployee === void 0 ? void 0 : findEmployee.value) || null,
                                            isPercentage: false,
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
                                            month: dateCopy.getMonth() + 1,
                                            year: dateCopy.getFullYear(),
                                            value: null,
                                            isPercentage: false,
                                        },
                                    });
                                }
                            }
                            else {
                                // find last months hour
                                if (monthArr && monthArr.length > 1) {
                                    const findEmployee = yield prisma_1.prisma.employeeCostValue.findFirst({
                                        where: {
                                            month: monthArr[1].month,
                                            year: dateCopy.getFullYear(),
                                            isPercentage: false,
                                            employeeFieldId: singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.id,
                                        },
                                    });
                                    // Maximum allocated hours
                                    yield prisma_1.prisma.employeeCostValue.create({
                                        data: {
                                            employee: { connect: { id: singleEmployee.id } },
                                            employeeCostField: {
                                                connect: { id: singleEmployeeCostFields.id },
                                            },
                                            month: dateCopy.getMonth() + 1,
                                            year: dateCopy.getFullYear(),
                                            value: (findEmployee === null || findEmployee === void 0 ? void 0 : findEmployee.value) || '0:00',
                                            isPercentage: false,
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
                                            month: dateCopy.getMonth() + 1,
                                            year: dateCopy.getFullYear(),
                                            value: '0:00',
                                            isPercentage: false,
                                        },
                                    });
                                }
                            }
                        }
                        else {
                            if (monthArr && monthArr.length > 1) {
                                const findEmployee = yield prisma_1.prisma.employeeCostValue.findFirst({
                                    where: {
                                        month: monthArr[1].month,
                                        year: dateCopy.getFullYear(),
                                        isPercentage: false,
                                        employeeFieldId: singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.id,
                                    },
                                });
                                // For all other fields where value is default 0
                                yield prisma_1.prisma.employeeCostValue.create({
                                    data: {
                                        employee: { connect: { id: singleEmployee.id } },
                                        employeeCostField: {
                                            connect: { id: singleEmployeeCostFields.id },
                                        },
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
                                        isPercentage: false,
                                        value: findEmployee === null || findEmployee === void 0 ? void 0 : findEmployee.value,
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
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
                                        isPercentage: false,
                                    },
                                });
                            }
                        }
                    }));
                })));
                yield Promise.all(employees.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    // Fetching all the fields of that employee
                    const employeeCostFields = yield prisma_1.prisma.employeeCostField.findMany({
                        where: {
                            companyId: companyId,
                            employeeId: singleEmployee.id,
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
                        var _d, _e, _f;
                        if (((_e = (_d = singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.field) === null || _d === void 0 ? void 0 : _d.configurationSection) === null || _e === void 0 ? void 0 : _e.no) == 0) {
                            if (((_f = singleEmployeeCostFields === null || singleEmployeeCostFields === void 0 ? void 0 : singleEmployeeCostFields.field) === null || _f === void 0 ? void 0 : _f.jsonId) == 'f1') {
                                yield prisma_1.prisma.employeeCostValue.create({
                                    data: {
                                        employee: { connect: { id: singleEmployee.id } },
                                        employeeCostField: {
                                            connect: { id: singleEmployeeCostFields.id },
                                        },
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
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
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
                                        value: '0:00',
                                        isPercentage: true,
                                    },
                                });
                            }
                        }
                        else {
                            yield prisma_1.prisma.employeeCostValue.create({
                                data: {
                                    employee: { connect: { id: singleEmployee.id } },
                                    employeeCostField: {
                                        connect: { id: singleEmployeeCostFields.id },
                                    },
                                    month: dateCopy.getMonth() + 1,
                                    year: dateCopy.getFullYear(),
                                    isPercentage: true,
                                },
                            });
                        }
                    }));
                })));
                return 'Monthly Value created successfully';
            }
            catch (error) {
                throw error;
            }
        });
    }
    // Creating the initial value
    createInitialValues(listOfEmployee, listOfFields, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Emp: ', listOfEmployee);
            console.log('Fields: ', listOfFields);
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
    createNewEmployeeCost(listOfEmployee, fieldId, companyId, listOfMonth) {
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
                    // creating the employee cost field value - hourly
                    yield Promise.all(listOfMonth.map((singleDate) => __awaiter(this, void 0, void 0, function* () {
                        const dateCopy = new Date(`${singleDate.month}/1/${singleDate.year}`);
                        yield prisma_1.prisma.employeeCostValue.create({
                            data: {
                                employee: { connect: { id: singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.id } },
                                employeeCostField: {
                                    connect: { id: employeeCostField === null || employeeCostField === void 0 ? void 0 : employeeCostField.id },
                                },
                                month: dateCopy.getMonth() + 1,
                                year: dateCopy.getFullYear(),
                                isPercentage: false,
                            },
                        });
                    })));
                    // creating the employee cost field value - percentage
                    yield Promise.all(listOfMonth.map((singleDate) => __awaiter(this, void 0, void 0, function* () {
                        const dateCopy = new Date(`${singleDate.month}/1/${singleDate.year}`);
                        yield prisma_1.prisma.employeeCostValue.create({
                            data: {
                                employee: { connect: { id: singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.id } },
                                employeeCostField: {
                                    connect: { id: employeeCostField === null || employeeCostField === void 0 ? void 0 : employeeCostField.id },
                                },
                                month: dateCopy.getMonth() + 1,
                                year: dateCopy.getFullYear(),
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
                            month: dateCopy.getMonth() + 1,
                            year: dateCopy.getFullYear(),
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
                            month: dateCopy.getMonth() + 1,
                            year: dateCopy.getFullYear(),
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
    updateMonthlyCost(employeeCostValueID, value, date, isCalculatorValue) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log(isCalculatorValue);
            try {
                const employeeCostValue = yield prisma_1.prisma.employeeCostValue.findFirst({
                    where: {
                        id: employeeCostValueID,
                    },
                    include: {
                        employeeCostField: {
                            include: {
                                field: true,
                            },
                        },
                    },
                });
                console.log(employeeCostValue);
                if (!employeeCostValue) {
                    throw new customError_1.CustomError(404, 'Employee cost field not found');
                }
                if (((_a = employeeCostValue === null || employeeCostValue === void 0 ? void 0 : employeeCostValue.employeeCostField.field) === null || _a === void 0 ? void 0 : _a.type) === 'Yearly') {
                    const year = new Date(date).getFullYear();
                    yield prisma_1.prisma.employeeCostValue.updateMany({
                        where: {
                            year: year,
                            isPercentage: false,
                            employeeCostField: {
                                id: employeeCostValue.employeeCostField.id,
                            },
                        },
                        data: {
                            value: value,
                        },
                    });
                }
                else {
                    yield prisma_1.prisma.employeeCostValue.update({
                        where: {
                            id: employeeCostValueID,
                        },
                        data: {
                            value: value,
                            // isCalculatorValue: isCalculatorValue,
                            // calculatorValue: value,
                        },
                    });
                }
                return 'Employee cost value updated successfully';
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For update the monthly cost value
    isMonthlyValueCreated(companyId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                const existedValue = yield prisma_1.prisma.monthYearTable.findFirst({
                    where: {
                        companyId: companyId,
                        month: dateCopy.getMonth() + 1,
                        year: dateCopy.getFullYear(),
                    },
                });
                return existedValue;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For update the monthly cost value
    createMonth(companyId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                const existedValue = yield prisma_1.prisma.monthYearTable.create({
                    data: {
                        companyId: companyId,
                        month: dateCopy.getMonth() + 1,
                        year: dateCopy.getFullYear(),
                    },
                });
                return existedValue;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For update the monthly cost value
    getMonthsByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const valueCreatedMonths = yield prisma_1.prisma.monthYearTable.findMany({
                    where: {
                        companyId: companyId,
                    },
                });
                return valueCreatedMonths;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new EmployeeCostRepository();
