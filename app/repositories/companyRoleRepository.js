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
class CompanyRoleRepository {
    constructor() {
        // Update role status
        this.updateStatus = (companyId, roleId, status) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.companyRole.updateMany({
                    where: {
                        companyId,
                        roleId,
                    },
                    data: {
                        status,
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
        // Update user status
        this.updateUserStatus = (companyId, roleId, userId, status) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.companyRole.updateMany({
                    where: {
                        companyId,
                        roleId,
                        userId,
                    },
                    data: {
                        status,
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    get(user, company, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyRole = yield prisma_1.prisma.companyRole.findFirst({
                    where: {
                        userId: user,
                        roleId: role,
                        companyId: company,
                    },
                    include: {
                        company: true,
                        role: true,
                        user: true,
                    },
                });
                return companyRole;
            }
            catch (err) {
                throw err;
            }
        });
    }
    //  Create A New Company Role Record
    create(user, role, company = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (company) {
                    const companyRole = yield prisma_1.prisma.companyRole.create({
                        data: {
                            user: { connect: { id: user } },
                            role: { connect: { id: role } },
                            company: { connect: { id: company } },
                        },
                        include: {
                            company: true,
                            role: true,
                            user: true,
                        },
                    });
                    return companyRole;
                }
                else {
                    const companyRole = yield prisma_1.prisma.companyRole.create({
                        data: {
                            user: { connect: { id: user } },
                            role: { connect: { id: role } },
                        },
                        include: {
                            company: true,
                            role: true,
                            user: true,
                        },
                    });
                    return companyRole;
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Check If user exists in the company
    userExistInCompany(company, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userExist = yield prisma_1.prisma.companyRole.findFirst({
                    where: {
                        companyId: company,
                        userId: user,
                    },
                });
                return userExist;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Delete user from company
    deleteUserFromCompany(user, company) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedUser = yield prisma_1.prisma.companyRole.deleteMany({
                    where: {
                        userId: user,
                        companyId: company,
                    },
                });
                return deletedUser;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update User role in company
    updateUserRole(user, company, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield prisma_1.prisma.companyRole.updateMany({
                    where: {
                        userId: user,
                        companyId: company,
                    },
                    data: {
                        roleId: role,
                    },
                });
                return updatedUser;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Find record with null companyId
    getRecordWithNullCompanyId(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield prisma_1.prisma.companyRole.findMany({
                    where: {
                        userId: user,
                        companyId: {
                            equals: null,
                        },
                    },
                    include: {
                        role: true,
                    },
                });
                return data;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Find if role exist in company
    checkCompanyRole(company, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyRole = yield prisma_1.prisma.companyRole.findMany({
                    where: {
                        companyId: company,
                        roleId: role,
                        userId: {
                            equals: null,
                        },
                    },
                });
                if ((companyRole === null || companyRole === void 0 ? void 0 : companyRole.length) > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update user in companyRole
    updateUserCompanyRole(user, company, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedData = yield prisma_1.prisma.companyRole.updateMany({
                    where: {
                        companyId: company,
                        roleId: role,
                    },
                    data: {
                        userId: user,
                    },
                });
                return updatedData;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new CompanyRoleRepository();
