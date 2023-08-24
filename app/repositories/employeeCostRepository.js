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
class EmployeeCostRepository {
    // For get the monthly cost value per employee
    getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                console.log(companyId, date, 'DDDD');
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: Object.assign({ companyId: companyId }, searchCondition), include: {
                        employeeCostField: {
                            include: {
                                field: true,
                                costValue: {
                                    where: {
                                        month: dateCopy.getMonth() + 1,
                                        year: dateCopy.getFullYear(),
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
    // For create the monthly values
    createMonthlyCost(employees, companyId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateCopy = new Date(date);
                yield Promise.all(employees.map((singleEmployee) => __awaiter(this, void 0, void 0, function* () {
                    // Fetching all the fields of that employee
                    const employeeCostFields = yield prisma_1.prisma.employeeCostField.findMany({
                        where: {
                            companyId: companyId,
                            employeeId: singleEmployee.id,
                        },
                        include: {
                            costValue: {
                                where: {
                                    month: dateCopy.getMonth() + 1,
                                    year: dateCopy.getFullYear(),
                                },
                            },
                        },
                    });
                    // Creating the values for single employee
                    employeeCostFields.map((singleEmployeeCostFields) => __awaiter(this, void 0, void 0, function* () {
                        if (singleEmployeeCostFields.costValue.length === 0) {
                            yield prisma_1.prisma.employeeCostValue.create({
                                data: {
                                    employee: { connect: { id: singleEmployee.id } },
                                    employeeCostField: {
                                        connect: { id: singleEmployeeCostFields.id },
                                    },
                                    month: dateCopy.getMonth() + 1,
                                    year: dateCopy.getFullYear(),
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
    // For update the monthly cost value
    updateMonthlyCost(employeeCostValueID, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.employeeCostValue.update({
                    where: {
                        id: employeeCostValueID,
                    },
                    data: {
                        value: value,
                    },
                });
                return 'Employee cost value updated successfully';
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new EmployeeCostRepository();
