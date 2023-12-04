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
const prisma_1 = require("../client/prisma");
const employeeCostRepository_1 = __importDefault(require("./employeeCostRepository"));
const payPeriodRepository_1 = __importDefault(require("./payPeriodRepository"));
class EmployeeRepository {
    getAllEmployeesByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employees = yield prisma_1.prisma.employee.findMany({
                    where: {
                        companyId: companyId,
                        active: true,
                    },
                    orderBy: {
                        fullName: 'asc',
                    },
                });
                return employees;
            }
            catch (err) {
                throw err;
            }
        });
    }
    updateOrCreateEmployee(empId, companyId, employeeData, listOfFields) {
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
                    // This is new code for creating fields for employees after syncing
                    if (listOfFields && (listOfFields === null || listOfFields === void 0 ? void 0 : listOfFields.length) > 0) {
                        yield Promise.all(listOfFields.map((singleField) => __awaiter(this, void 0, void 0, function* () {
                            yield prisma_1.prisma.employeeCostField.create({
                                data: {
                                    employee: { connect: { id: updatedEmployees.id } },
                                    field: { connect: { id: singleField.id } },
                                    company: { connect: { id: companyId } },
                                },
                            });
                        })));
                        // Fetch all pay periods
                        const payPeriods = yield payPeriodRepository_1.default.getAll({
                            companyId: companyId,
                        });
                        // Create initial values
                        if (payPeriods.length > 0) {
                            payPeriods.map((singlePayPeriod) => __awaiter(this, void 0, void 0, function* () {
                                yield employeeCostRepository_1.default.createMonthlyCost([updatedEmployees], companyId, singlePayPeriod.id);
                            }));
                        }
                        // OLD REQUIREMENT CODE NEED TO UPDATE WITH NEW
                        // const monthList = await prisma.monthYearTable.findMany({
                        // 	where: {
                        // 		companyId: companyId,
                        // 	},
                        // });
                        // // Create initial values
                        // monthList?.map(async (singleRecord: any) => {
                        // 	await employeeCostRepository.createMonthlyCost(
                        // 		[updatedEmployees],
                        // 		companyId,
                        // 		new Date(
                        // 			`${singleRecord?.month}/1/${singleRecord?.year}`
                        // 		).toString()
                        // 	);
                        // });
                    }
                }
                return updatedEmployees;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getEmployeeDetails(employeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const employee = yield prisma_1.prisma.employee.findUnique({
                where: {
                    id: employeeId,
                },
            });
            return employee;
        });
    }
}
exports.default = new EmployeeRepository();
