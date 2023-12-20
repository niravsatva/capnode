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
const logger_1 = require("../utils/logger");
const companyRoleRepository_1 = __importDefault(require("./companyRoleRepository"));
const subscriptionRepository_1 = __importDefault(require("./subscriptionRepository"));
class CompanyRepository {
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companies = yield prisma_1.prisma.company.findMany();
                return companies;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getUserCompanies(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companies = yield prisma_1.prisma.user.findFirst({
                    where: {
                        id: id,
                    },
                    include: {
                        companies: {
                            include: {
                                company: true,
                                role: true,
                            },
                        },
                    },
                });
                return companies;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield prisma_1.prisma.company.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        users: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                                company: {
                                    select: {
                                        id: true,
                                        tenantName: true,
                                    },
                                },
                                role: {
                                    select: {
                                        id: true,
                                        roleName: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return company;
            }
            catch (err) {
                throw err;
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield prisma_1.prisma.company.create({
                    data: data,
                });
                return company;
            }
            catch (err) {
                throw err;
            }
        });
    }
    connectCompany(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyAdminRole = yield prisma_1.prisma.role.findFirst({
                    where: {
                        roleName: {
                            mode: 'insensitive',
                            equals: 'Company Admin',
                        },
                    },
                });
                // const company = await prisma.companyRole.create({
                // 	data: {
                // 		user: { connect: { id: userId } },
                // 		role: { connect: { id: companyAdminRole?.id } },
                // 		company: { connect: { id: companyId } },
                // 	},
                // });
                const companyRole = yield prisma_1.prisma.companyRole.findFirst({
                    where: {
                        userId: userId,
                        roleId: companyAdminRole === null || companyAdminRole === void 0 ? void 0 : companyAdminRole.id,
                        companyId: {
                            equals: null,
                        },
                    },
                });
                let company;
                if (companyRole) {
                    company = yield prisma_1.prisma.companyRole.update({
                        where: {
                            id: companyRole === null || companyRole === void 0 ? void 0 : companyRole.id,
                        },
                        data: {
                            company: { connect: { id: companyId } },
                        },
                    });
                }
                else {
                    company = yield companyRoleRepository_1.default.create(userId, companyAdminRole === null || companyAdminRole === void 0 ? void 0 : companyAdminRole.id, companyId);
                }
                const subscriptionData = yield subscriptionRepository_1.default.findSubscriptionByUserIdWithNullCompany(userId);
                // If found attach the companyId to existing subscription else create new entry for reference only;
                if (subscriptionData) {
                    yield subscriptionRepository_1.default.updateSubscription(subscriptionData.id, { companyId });
                }
                return company;
            }
            catch (err) {
                throw err;
            }
        });
    }
    updateCompany(companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCompany = yield prisma_1.prisma.company.update({
                    where: {
                        id: companyId,
                    },
                    data: data,
                });
                return updatedCompany;
            }
            catch (err) {
                logger_1.logger.error('Err: ', err);
                throw err;
            }
        });
    }
    updateStatus(companyId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedCompany = yield prisma_1.prisma.company.update({
                    where: {
                        id: companyId,
                    },
                    data: {
                        status: status,
                    },
                });
                return updatedCompany;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getCompanyByTenantId(tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyDetails = yield prisma_1.prisma.company.findFirst({
                    where: {
                        tenantID: tenantId,
                    },
                });
                return companyDetails;
            }
            catch (err) {
                throw err;
            }
        });
    }
    getAllUsers(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma_1.prisma.user.findMany({
                where: {
                    companies: {
                        some: {
                            companyId: companyId,
                        },
                    },
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            });
            return users;
        });
    }
}
exports.default = new CompanyRepository();
