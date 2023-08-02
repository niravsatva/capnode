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
const data_1 = require("../constants/data");
class RoleRepositories {
    constructor() {
        this.checkIsUsersInRole = (roleId, companyId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma_1.prisma.companyRole.count({
                    where: {
                        roleId: roleId,
                        companyId: companyId,
                        userId: {
                            not: null,
                        },
                    },
                });
                return users;
            }
            catch (error) {
                throw error;
            }
        });
        // For create the role
        this.createRole = (roleName, roleDescription, isAdminRole, isCompanyAdmin) => __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield prisma_1.prisma.role.create({
                    data: {
                        roleName,
                        roleDescription,
                        isAdminRole,
                        isCompanyAdmin,
                        permissions: {
                            createMany: {
                                data: data_1.DefaultPermissions,
                            },
                        },
                    },
                });
                return role;
            }
            catch (error) {
                throw error;
            }
        });
        this.combineRoleCompany = (companyId, roleId) => __awaiter(this, void 0, void 0, function* () {
            const companyRole = yield prisma_1.prisma.companyRole.create({
                data: {
                    company: { connect: { id: companyId } },
                    role: { connect: { id: roleId } },
                },
            });
            return companyRole;
        });
        // Check ROle By Name
        this.checkAdmin = (roleName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield prisma_1.prisma.role.findFirst({
                    where: {
                        roleName: {
                            equals: roleName,
                            mode: 'insensitive',
                        },
                    },
                });
                return role;
            }
            catch (err) {
                throw err;
            }
        });
        // For get all the roles of some organization
        this.getAllRole = (sortCondition = 'asc', search = '', page, company, offset, limit, filterConditions) => __awaiter(this, void 0, void 0, function* () {
            const searchRegex = new RegExp(search, 'ig');
            try {
                const roles = yield prisma_1.prisma.role.findMany({
                    where: Object.assign(Object.assign({ isCompanyAdmin: false, isAdminRole: false, OR: [
                            {
                                roleName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                            {
                                roleDescription: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                        ] }, filterConditions), { users: {
                            some: {
                                companyId: company,
                            },
                        } }),
                    skip: offset,
                    take: limit,
                    orderBy: {
                        roleName: sortCondition,
                    },
                });
                const rolesList = roles === null || roles === void 0 ? void 0 : roles.map((singleRole) => singleRole);
                if (page === 1) {
                    if (searchRegex.test('admin') || search === '') {
                        const adminRole = yield prisma_1.prisma.role.findFirst({
                            where: {
                                roleName: {
                                    mode: 'insensitive',
                                    equals: 'admin',
                                },
                                isAdminRole: true,
                            },
                        });
                        if (adminRole) {
                            if (sortCondition === 'asc') {
                                return [adminRole, ...rolesList];
                            }
                            else {
                                return [...rolesList, adminRole];
                            }
                        }
                        else {
                            return [...rolesList];
                        }
                    }
                    return [...rolesList];
                }
                else {
                    return rolesList;
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
        // For update the role
        this.updateRole = ({ roleId, data }) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.role.update({
                    where: {
                        id: roleId,
                    },
                    data: data,
                });
            }
            catch (error) {
                throw error;
            }
        });
        // For delete the role from company role table
        this.deleteCompanyRole = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.companyRole.deleteMany({
                    where: {
                        roleId: id,
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
        // For delete the role from role table
        this.deleteRole = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TEMP code
                yield prisma_1.prisma.invitations.deleteMany({
                    where: {
                        roleId: id,
                    },
                });
                yield prisma_1.prisma.role.deleteMany({
                    where: {
                        id,
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield prisma_1.prisma.role.findFirst({
                    where: {
                        id: id,
                    },
                    include: {
                        permissions: true,
                    },
                });
                return role;
            }
            catch (err) {
                throw err;
            }
        });
    }
    checkCompanyAndRole(roleId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isValid = yield prisma_1.prisma.company.findFirst({
                    where: {
                        id: companyId,
                        users: {
                            some: {
                                roleId: roleId,
                            },
                        },
                    },
                });
                return isValid;
            }
            catch (err) {
                throw err;
            }
        });
    }
    isSameNameRole(companyId, roleName, roleId = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isExistingRole = yield prisma_1.prisma.role.findFirst({
                    where: {
                        id: {
                            not: roleId,
                        },
                        roleName: {
                            mode: 'insensitive',
                            equals: roleName,
                        },
                        users: {
                            some: {
                                company: { id: companyId },
                            },
                        },
                    },
                });
                if (isExistingRole) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    // Get total count
    count(search, company) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const total = yield prisma_1.prisma.role.count({
                    where: {
                        isCompanyAdmin: false,
                        isAdminRole: false,
                        users: {
                            some: {
                                companyId: company,
                            },
                        },
                        OR: [
                            {
                                roleName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                            {
                                roleDescription: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                        ],
                    },
                });
                // Removing company admin role count
                return total + 1;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    // Check if user exist in the company
    userExist(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.prisma.companyRole.findMany({
                    where: {
                        userId: userId,
                        companyId: companyId,
                    },
                });
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Check company admin role by id
    checkCompanyAdminRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isCompanyAdmin = yield prisma_1.prisma.role.findUnique({
                    where: {
                        id: roleId,
                    },
                });
                return isCompanyAdmin;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new RoleRepositories();
