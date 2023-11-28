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
class UserRepository {
    // Get all users
    getAll(company, offset, limit, filterConditions, searchCondition, sortCondition) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const sortPosition = ((_a = sortCondition === null || sortCondition === void 0 ? void 0 : sortCondition.orderBy) === null || _a === void 0 ? void 0 : _a.firstName) || 'asc';
            try {
                const users = yield prisma_1.prisma.companyRole.findMany({
                    where: Object.assign(Object.assign({}, filterConditions), { 
                        // ...searchCondition,
                        user: Object.assign({}, searchCondition), companyId: company, NOT: {
                            userId: null,
                        } }),
                    orderBy: {
                        user: {
                            firstName: sortPosition || 'asc',
                        },
                    },
                    include: {
                        role: true,
                        user: true,
                    },
                    skip: offset,
                    take: limit,
                });
                // const res = await prisma.user.findMany({
                // 	where: {
                // 		...filterConditions,
                // 		...searchCondition,
                // 		companies: {
                // 			some: {
                // 				companyId: company,
                // 			},
                // 		},
                // 	},
                // 	skip: offset,
                // 	take: limit,
                // 	include: {
                // 		companies: {
                // 			select: {
                // 				role: {
                // 					select: {
                // 						id: true,
                // 						roleName: true,
                // 						isAdminRole: true,
                // 					},
                // 				},
                // 				company: {
                // 					select: {
                // 						id: true,
                // 						tenantName: true,
                // 					},
                // 				},
                // 			},
                // 		},
                // 	},
                // 	...sortCondition,
                // });
                return users;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    checkAddUserLimit(company) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalNoOfUser = yield prisma_1.prisma.companyRole.findMany({
                where: {
                    companyId: company,
                    userId: {
                        not: null,
                    },
                    status: true,
                },
            });
            // const totalNoOfUser = await prisma.user.findMany({
            // 	where: {
            // 		companies: {
            // 			some: {
            // 				companyId: company,
            // 				userId: {
            // 					not: null,
            // 				},
            // 				status: true,
            // 			},
            // 		},
            // 	},
            // });
            const totalAdminUser = yield prisma_1.prisma.companyRole.findMany({
                where: {
                    companyId: company,
                    status: true,
                    userId: {
                        not: null,
                    },
                    role: {
                        isAdminRole: true,
                    },
                },
            });
            return { totalNoOfUser, totalAdminUser };
        });
    }
    checkNoOfAdmin(company) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.user.findMany({
                where: {
                    companies: {
                        some: {
                            companyId: company,
                            userId: {
                                not: null,
                            },
                        },
                    },
                },
            });
        });
    }
    // Get data by id
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.prisma.user.findMany({
                    where: {
                        id: id,
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        status: true,
                        profileImg: true,
                        companies: {
                            where: {
                                NOT: {
                                    companyId: null,
                                },
                                status: true,
                            },
                            select: {
                                id: true,
                                userId: true,
                                companyId: true,
                                status: true,
                                company: {
                                    select: {
                                        id: true,
                                        tenantID: true,
                                        tenantName: true,
                                        accessTokenUTCDate: true,
                                        customerLastSyncDate: true,
                                        employeeLastSyncDate: true,
                                        timeActivitiesLastSyncDate: true,
                                        classLastSyncDate: true,
                                        isConnected: true,
                                        status: true,
                                        fiscalYear: true,
                                        configuration: true,
                                        Subscription: true
                                    },
                                },
                                role: {
                                    select: {
                                        id: true,
                                        roleName: true,
                                        roleDescription: true,
                                        isCompanyAdmin: true,
                                        isAdminRole: true,
                                        status: true,
                                        permissions: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return user[0];
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get data by email
    getByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        status: true,
                        isVerified: true,
                        password: true,
                        forgotPasswordToken: true,
                        forgotPasswordTokenExpiresAt: true,
                        companies: {
                            select: {
                                id: true,
                                userId: true,
                                roleId: true,
                                companyId: true,
                                status: true,
                                company: {
                                    select: {
                                        id: true,
                                        tenantID: true,
                                        tenantName: true,
                                        customerLastSyncDate: true,
                                        classLastSyncDate: true,
                                        employeeLastSyncDate: true,
                                        isConnected: true,
                                        status: true,
                                        fiscalYear: true,
                                        Subscription: true
                                    },
                                },
                                role: {
                                    select: {
                                        id: true,
                                        roleName: true,
                                        roleDescription: true,
                                        isCompanyAdmin: true,
                                        isAdminRole: true,
                                        status: true,
                                        permissions: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Register a user
    register(firstName, lastName, email, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.prisma.user.create({
                    data: {
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        customerId: customerId,
                    },
                });
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    //  Create a new user
    create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.prisma.user.create({
                    data: userData,
                });
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update user
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.prisma.user.update({
                    where: { id: id },
                    data: data,
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        isVerified: true,
                        status: true,
                        profileImg: true,
                        customerId: true,
                        companies: {
                            where: {
                                NOT: {
                                    companyId: null,
                                },
                            },
                            select: {
                                id: true,
                                userId: true,
                                roleId: true,
                                companyId: true,
                                status: true,
                                company: {
                                    select: {
                                        id: true,
                                        tenantName: true,
                                        tenantID: true,
                                        accessTokenUTCDate: true,
                                        customerLastSyncDate: true,
                                        classLastSyncDate: true,
                                        isConnected: true,
                                        status: true,
                                        fiscalYear: true,
                                    },
                                },
                                role: {
                                    select: {
                                        id: true,
                                        roleName: true,
                                        roleDescription: true,
                                        isCompanyAdmin: true,
                                        isAdminRole: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                    // include: {
                    // 	companies: {
                    // 		where: {
                    // 			NOT: {
                    // 				companyId: null,
                    // 			},
                    // 		},
                    // 		include: {
                    // 			company: true,
                    // 			role: true,
                    // 		},
                    // 	},
                    // },
                });
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get total count
    count(company, filterConditions, searchCondition) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const total = yield prisma_1.prisma.companyRole.count({
                    where: Object.assign(Object.assign({}, filterConditions), { user: Object.assign({}, searchCondition), companyId: company, NOT: {
                            userId: null,
                        } }),
                });
                return total;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // async count(company: string, filterConditions: any, searchCondition: any) {
    // 	try {
    // 		const total = await prisma.user.count({
    // 			where: { ...filterConditions, ...searchCondition },
    // 		});
    // 		return total;
    // 	} catch (err) {
    // 		throw err;
    // 	}
    // }
    // Get all admin emails
    getAllAdminEmails(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminEmails = yield prisma_1.prisma.companyRole.findMany({
                    where: {
                        companyId: companyId,
                        OR: [
                            {
                                role: {
                                    isAdminRole: true,
                                },
                            },
                            {
                                role: {
                                    isCompanyAdmin: true,
                                },
                            },
                        ],
                    },
                    select: {
                        user: {
                            select: {
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });
                return adminEmails;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new UserRepository();
