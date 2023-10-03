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
    getMonthlyCost(companyId, date, offset, limit, searchCondition, sortCondition, isPercentage, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const dateCopy = new Date(date);
                const employeesCostByMonth = yield prisma_1.prisma.employee.findMany(Object.assign({ where: Object.assign({ companyId: companyId }, searchCondition), include: {
                        employeeCostField: {
                            include: {
                                field: true,
                                costValue: {
                                    where: {
                                        payPeriodId: payPeriodId,
                                        isPercentage: true,
                                    },
                                    // where: {
                                    // 	month: dateCopy.getMonth() + 1,
                                    // 	year: dateCopy.getFullYear(),
                                    // 	isPercentage: isPercentage,
                                    // },
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
    getMonthlyCostExport(companyId, date, searchCondition, sortCondition, isPercentage, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isPercentageValue = isPercentage || true;
            try {
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
    // Create monthly cost values for all employees
    createMonthlyCost(employees, companyId, payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                        yield prisma_1.prisma.employeeCostValue.create({
                            data: {
                                employee: { connect: { id: singleEmployee.id } },
                                employeeCostField: {
                                    connect: { id: singleEmployeeCostFields.id },
                                },
                                payPeriod: { connect: { id: payPeriodId } },
                                isPercentage: true,
                            },
                        });
                    }
                }));
            })));
            return 'Percentage values created successfully';
        });
    }
    // For create the monthly values
    // async createMonthlyCost(employees: any, companyId: string, date: any) {
    // 	try {
    // 		// OLD Requirement
    // 		const dateCopy = new Date(date);
    // 		const monthArr: any = await prisma.monthYearTable.findMany({
    // 			where: {
    // 				year: dateCopy.getFullYear(),
    // 				companyId: companyId,
    // 			},
    // 			orderBy: {
    // 				month: 'desc',
    // 			},
    // 		});
    // 		const uniqueEmployeeIds = new Set();
    // 		const filteredEmployees = employees?.filter((singleEmployee: any) => {
    // 			if (!uniqueEmployeeIds.has(singleEmployee.id)) {
    // 				uniqueEmployeeIds.add(singleEmployee.id);
    // 				return true;
    // 			}
    // 			return false;
    // 		});
    // 		await Promise.all(
    // 			filteredEmployees.map(async (singleEmployee: any) => {
    // 				const getEmployeeHours = await overHoursRepository.getOverHoursByYear(
    // 					companyId,
    // 					singleEmployee?.id,
    // 					dateCopy.getFullYear()
    // 				);
    // 				if (!getEmployeeHours) {
    // 					const createEmployeeHours =
    // 						await overHoursRepository.createOverHoursByYear(
    // 							companyId,
    // 							singleEmployee?.id,
    // 							dateCopy.getFullYear()
    // 						);
    // 					console.log('Created EmployeeHours: ' + createEmployeeHours);
    // 				}
    // 			})
    // 		);
    // 		await Promise.all(
    // 			employees.map(async (singleEmployee: any) => {
    // 				// Fetching all the fields of that employee
    // 				const employeeCostFields = await prisma.employeeCostField.findMany({
    // 					where: {
    // 						companyId: companyId,
    // 						employeeId: singleEmployee.id,
    // 					},
    // 					select: {
    // 						id: true,
    // 						employee: true,
    // 						employeeId: true,
    // 						company: true,
    // 						companyId: true,
    // 						fieldId: true,
    // 						field: {
    // 							select: {
    // 								jsonId: true,
    // 								configurationSection: {
    // 									select: {
    // 										no: true,
    // 									},
    // 								},
    // 							},
    // 						},
    // 					},
    // 				});
    // 				// Creating the values for single employee - For Hourly Method
    // 				employeeCostFields.map(async (singleEmployeeCostFields) => {
    // 					if (
    // 						singleEmployeeCostFields?.field?.configurationSection?.no == 0
    // 					) {
    // 						if (singleEmployeeCostFields?.field?.jsonId == 'f1') {
    // 							// Employee Type field
    // 							if (monthArr && monthArr.length > 1) {
    // 								const findEmployee = await prisma.employeeCostValue.findFirst(
    // 									{
    // 										where: {
    // 											month: monthArr[1].month,
    // 											year: dateCopy.getFullYear(),
    // 											isPercentage: false,
    // 											employeeFieldId: singleEmployeeCostFields?.id,
    // 										},
    // 									}
    // 								);
    // 								await prisma.employeeCostValue.create({
    // 									data: {
    // 										employee: { connect: { id: singleEmployee.id } },
    // 										employeeCostField: {
    // 											connect: { id: singleEmployeeCostFields.id },
    // 										},
    // 										month: dateCopy.getMonth() + 1,
    // 										year: dateCopy.getFullYear(),
    // 										value: findEmployee?.value || null,
    // 										isPercentage: false,
    // 									},
    // 								});
    // 							} else {
    // 								await prisma.employeeCostValue.create({
    // 									data: {
    // 										employee: { connect: { id: singleEmployee.id } },
    // 										employeeCostField: {
    // 											connect: { id: singleEmployeeCostFields.id },
    // 										},
    // 										month: dateCopy.getMonth() + 1,
    // 										year: dateCopy.getFullYear(),
    // 										value: null,
    // 										isPercentage: false,
    // 									},
    // 								});
    // 							}
    // 						} else {
    // 							// find last months hour
    // 							if (monthArr && monthArr.length > 1) {
    // 								const findEmployee = await prisma.employeeCostValue.findFirst(
    // 									{
    // 										where: {
    // 											month: monthArr[1].month,
    // 											year: dateCopy.getFullYear(),
    // 											isPercentage: false,
    // 											employeeFieldId: singleEmployeeCostFields?.id,
    // 										},
    // 									}
    // 								);
    // 								// Maximum allocated hours
    // 								await prisma.employeeCostValue.create({
    // 									data: {
    // 										employee: { connect: { id: singleEmployee.id } },
    // 										employeeCostField: {
    // 											connect: { id: singleEmployeeCostFields.id },
    // 										},
    // 										month: dateCopy.getMonth() + 1,
    // 										year: dateCopy.getFullYear(),
    // 										value: findEmployee?.value || '0:00',
    // 										isPercentage: false,
    // 									},
    // 								});
    // 							} else {
    // 								await prisma.employeeCostValue.create({
    // 									data: {
    // 										employee: { connect: { id: singleEmployee.id } },
    // 										employeeCostField: {
    // 											connect: { id: singleEmployeeCostFields.id },
    // 										},
    // 										month: dateCopy.getMonth() + 1,
    // 										year: dateCopy.getFullYear(),
    // 										value: '0:00',
    // 										isPercentage: false,
    // 									},
    // 								});
    // 							}
    // 						}
    // 					} else {
    // 						if (monthArr && monthArr.length > 1) {
    // 							const findEmployee = await prisma.employeeCostValue.findFirst({
    // 								where: {
    // 									month: monthArr[1].month,
    // 									year: dateCopy.getFullYear(),
    // 									isPercentage: false,
    // 									employeeFieldId: singleEmployeeCostFields?.id,
    // 								},
    // 							});
    // 							// For all other fields where value is default 0
    // 							await prisma.employeeCostValue.create({
    // 								data: {
    // 									employee: { connect: { id: singleEmployee.id } },
    // 									employeeCostField: {
    // 										connect: { id: singleEmployeeCostFields.id },
    // 									},
    // 									month: dateCopy.getMonth() + 1,
    // 									year: dateCopy.getFullYear(),
    // 									isPercentage: false,
    // 									value: findEmployee?.value,
    // 								},
    // 							});
    // 						} else {
    // 							await prisma.employeeCostValue.create({
    // 								data: {
    // 									employee: { connect: { id: singleEmployee.id } },
    // 									employeeCostField: {
    // 										connect: { id: singleEmployeeCostFields.id },
    // 									},
    // 									month: dateCopy.getMonth() + 1,
    // 									year: dateCopy.getFullYear(),
    // 									isPercentage: false,
    // 								},
    // 							});
    // 						}
    // 					}
    // 				});
    // 			})
    // 		);
    // 		await Promise.all(
    // 			employees.map(async (singleEmployee: any) => {
    // 				// Fetching all the fields of that employee
    // 				const employeeCostFields = await prisma.employeeCostField.findMany({
    // 					where: {
    // 						companyId: companyId,
    // 						employeeId: singleEmployee.id,
    // 					},
    // 					select: {
    // 						id: true,
    // 						employee: true,
    // 						employeeId: true,
    // 						company: true,
    // 						companyId: true,
    // 						fieldId: true,
    // 						field: {
    // 							select: {
    // 								jsonId: true,
    // 								configurationSection: {
    // 									select: {
    // 										no: true,
    // 									},
    // 								},
    // 							},
    // 						},
    // 					},
    // 				});
    // 				// Creating the values for single employee - For Percentage Method
    // 				employeeCostFields.map(async (singleEmployeeCostFields) => {
    // 					if (
    // 						singleEmployeeCostFields?.field?.configurationSection?.no == 0
    // 					) {
    // 						if (singleEmployeeCostFields?.field?.jsonId == 'f1') {
    // 							await prisma.employeeCostValue.create({
    // 								data: {
    // 									employee: { connect: { id: singleEmployee.id } },
    // 									employeeCostField: {
    // 										connect: { id: singleEmployeeCostFields.id },
    // 									},
    // 									month: dateCopy.getMonth() + 1,
    // 									year: dateCopy.getFullYear(),
    // 									value: null,
    // 									isPercentage: true,
    // 								},
    // 							});
    // 						} else {
    // 							await prisma.employeeCostValue.create({
    // 								data: {
    // 									employee: { connect: { id: singleEmployee.id } },
    // 									employeeCostField: {
    // 										connect: { id: singleEmployeeCostFields.id },
    // 									},
    // 									month: dateCopy.getMonth() + 1,
    // 									year: dateCopy.getFullYear(),
    // 									value: '0:00',
    // 									isPercentage: true,
    // 								},
    // 							});
    // 						}
    // 					} else {
    // 						await prisma.employeeCostValue.create({
    // 							data: {
    // 								employee: { connect: { id: singleEmployee.id } },
    // 								employeeCostField: {
    // 									connect: { id: singleEmployeeCostFields.id },
    // 								},
    // 								month: dateCopy.getMonth() + 1,
    // 								year: dateCopy.getFullYear(),
    // 								isPercentage: true,
    // 							},
    // 						});
    // 					}
    // 				});
    // 			})
    // 		);
    // 		return 'Monthly Value created successfully';
    // 	} catch (error) {
    // 		throw error;
    // 	}
    // }
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
                    // creating the employee cost field value - hourly
                    // await Promise.all(
                    // 	listOfPayPeriods.map(async (singlePayPeriod: any) => {
                    // 		await prisma.employeeCostValue.create({
                    // 			data: {
                    // 				employee: { connect: { id: singleEmployee?.id } },
                    // 				employeeCostField: {
                    // 					connect: { id: employeeCostField?.id },
                    // 				},
                    // 				payPeriod: { connect: { id: singlePayPeriod?.id } },
                    // 				isPercentage: false,
                    // 			},
                    // 		});
                    // 	})
                    // );
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
                console.log('Date : ', dateCopy);
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
                            // month: dateCopy.getMonth() + 1,
                            // year: dateCopy.getFullYear(),
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
                console.log('Pay period : ', payPeriodId, isCalculatorValue);
                const updatedCost = yield prisma_1.prisma.employeeCostValue.update({
                    where: {
                        id: employeeCostValueID,
                    },
                    data: {
                        value: value,
                    },
                });
                // const employeeCostValue = await prisma.employeeCostValue.findFirst({
                // 	where: {
                // 		id: employeeCostValueID,
                // 	},
                // 	include: {
                // 		employeeCostField: {
                // 			include: {
                // 				field: true,
                // 			},
                // 		},
                // 	},
                // });
                // if (!employeeCostValue) {
                // 	throw new CustomError(404, 'Employee cost field not found');
                // }
                // if (employeeCostValue?.employeeCostField.field?.type === 'Yearly') {
                // 	const year = new Date(date!).getFullYear();
                // 	console.log('Year: ' + year);
                // 	await prisma.employeeCostValue.updateMany({
                // 		where: {
                // 			year: year,
                // 			isPercentage: false,
                // 			employeeCostField: {
                // 				id: employeeCostValue.employeeCostField.id,
                // 			},
                // 		},
                // 		data: {
                // 			value: value,
                // 		},
                // 	});
                // } else {
                // 	await prisma.employeeCostValue.update({
                // 		where: {
                // 			id: employeeCostValueID,
                // 		},
                // 		data: {
                // 			value: value,
                // 			// isCalculatorValue: isCalculatorValue,
                // 			// calculatorValue: value,
                // 		},
                // 	});
                // }
                return updatedCost;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new EmployeeCostRepository();
