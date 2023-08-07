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
class EmployeeRepository {
    getAllEmployeesByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employees = yield prisma_1.prisma.employee.findMany({
                    where: {
                        companyId: companyId,
                    },
                });
                return employees;
            }
            catch (err) {
                throw err;
            }
        });
    }
    updateOrCreateEmployees(empId, companyId, employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employee = yield prisma_1.prisma.employee.findFirst({
                    where: {
                        employeeId: empId,
                        companyId: companyId,
                    },
                });
                let updatedEmployees;
                if (employee) {
                    const updated = yield prisma_1.prisma.employee.updateMany({
                        where: {
                            employeeId: empId,
                            companyId: companyId,
                        },
                        data: {
                            fullName: employeeData === null || employeeData === void 0 ? void 0 : employeeData.fullName,
                            email: employeeData === null || employeeData === void 0 ? void 0 : employeeData.email,
                            phone: employeeData === null || employeeData === void 0 ? void 0 : employeeData.phone,
                            active: employeeData === null || employeeData === void 0 ? void 0 : employeeData.active,
                        },
                    });
                    updatedEmployees = updated[0];
                }
                else {
                    updatedEmployees = yield prisma_1.prisma.employee.create({
                        data: {
                            employeeId: employeeData === null || employeeData === void 0 ? void 0 : employeeData.employeeId,
                            fullName: employeeData === null || employeeData === void 0 ? void 0 : employeeData.fullName,
                            email: employeeData === null || employeeData === void 0 ? void 0 : employeeData.email,
                            phone: employeeData === null || employeeData === void 0 ? void 0 : employeeData.phone,
                            active: employeeData === null || employeeData === void 0 ? void 0 : employeeData.active,
                            company: { connect: { id: employeeData === null || employeeData === void 0 ? void 0 : employeeData.companyId } },
                        },
                    });
                }
                return updatedEmployees;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new EmployeeRepository();