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
// import employeeCostRepository from './employeeCostRepository';
// import payPeriodRepository from './payPeriodRepository';
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
                    // if (listOfFields && listOfFields?.length > 0) {
                    // 	await Promise.all(
                    // 		listOfFields.map(async (singleField: any) => {
                    // 			await prisma.employeeCostField.create({
                    // 				data: {
                    // 					employee: { connect: { id: updatedEmployees.id } },
                    // 					field: { connect: { id: singleField.id } },
                    // 					company: { connect: { id: companyId } },
                    // 				},
                    // 			});
                    // 		})
                    // 	);
                    // 	// Fetch all pay periods
                    // 	const payPeriods = await payPeriodRepository.getAll({
                    // 		companyId: companyId,
                    // 	});
                    // 	// Create initial values
                    // 	if (payPeriods.length > 0) {
                    // 		payPeriods.map(async (singlePayPeriod: any) => {
                    // 			await employeeCostRepository.createMonthlyCost(
                    // 				[updatedEmployees],
                    // 				companyId,
                    // 				singlePayPeriod.id
                    // 			);
                    // 		});
                    // 	}
                    // 	// OLD REQUIREMENT CODE NEED TO UPDATE WITH NEW
                    // 	// const monthList = await prisma.monthYearTable.findMany({
                    // 	// 	where: {
                    // 	// 		companyId: companyId,
                    // 	// 	},
                    // 	// });
                    // 	// // Create initial values
                    // 	// monthList?.map(async (singleRecord: any) => {
                    // 	// 	await employeeCostRepository.createMonthlyCost(
                    // 	// 		[updatedEmployees],
                    // 	// 		companyId,
                    // 	// 		new Date(
                    // 	// 			`${singleRecord?.month}/1/${singleRecord?.year}`
                    // 	// 		).toString()
                    // 	// 	);
                    // 	// });
                    // }
                    if (listOfFields && listOfFields.length) {
                        for (const singleField of listOfFields) {
                            const employeeCostField = yield prisma_1.prisma.employeeCostField.create({
                                data: {
                                    companyId,
                                    payPeriodId: singleField.payPeriodId,
                                    fieldId: singleField.id,
                                    employeeId: updatedEmployees.id
                                }
                            });
                            yield prisma_1.prisma.employeeCostValue.create({
                                data: {
                                    employeeId: updatedEmployees.id,
                                    employeeFieldId: employeeCostField.id,
                                    payPeriodId: singleField.payPeriodId,
                                    isPercentage: true,
                                    value: '0.00',
                                },
                            });
                        }
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
