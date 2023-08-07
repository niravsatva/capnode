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
                const company = yield prisma_1.prisma.companyRole.update({
                    where: {
                        id: companyRole === null || companyRole === void 0 ? void 0 : companyRole.id,
                    },
                    data: {
                        company: { connect: { id: companyId } },
                    },
                });
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
                console.log('Err: ', err);
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
}
exports.default = new CompanyRepository();
