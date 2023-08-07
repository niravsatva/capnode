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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
class RoleService {
    constructor() {
        // Get all the roles
        this.getAllRoles = (company, page, limit, search, filter, type, sort) => __awaiter(this, void 0, void 0, function* () {
            try {
                // checking is user permitted
                // Offset set
                let offset;
                if (page === 1) {
                    offset = (Number(page) - 1) * Number(limit);
                    limit = limit - 1;
                }
                else {
                    offset = (Number(page) - 1) * Number(limit) - 1;
                }
                const filterConditions = filter
                    ? { status: filter == 'true' ? true : false }
                    : {};
                // Conditions for sort
                // Get all roles
                const roles = yield repositories_1.roleRepository.getAllRole(sort, search, page, company, offset, limit, filterConditions);
                const total = yield repositories_1.roleRepository.count(search, company);
                return { roles, total: total };
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
        // For create a role
        this.createRole = ({ isAdminRole = false, roleName, roleDescription, orgId, isCompanyRole = false, }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const isSameNameRole = yield repositories_1.roleRepository.isSameNameRole(orgId, roleName);
                if (isSameNameRole) {
                    throw new customError_1.CustomError(400, 'Role already exist with the same name');
                }
                else {
                    const role = yield repositories_1.roleRepository.createRole(roleName, roleDescription, isAdminRole, isCompanyRole);
                    yield repositories_1.roleRepository.combineRoleCompany(orgId, role.id);
                    return role;
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
        // For update the role
        this.updateUserRole = (finalData) => __awaiter(this, void 0, void 0, function* () {
            const { roleId, orgId } = finalData, data = __rest(finalData, ["roleId", "orgId"]);
            try {
                const role = yield repositories_1.roleRepository.getDetails(roleId);
                const isFromSameOrg = yield repositories_1.roleRepository.checkCompanyAndRole(roleId, orgId);
                if (data === null || data === void 0 ? void 0 : data.roleName) {
                    const isSameNameRole = yield repositories_1.roleRepository.isSameNameRole(orgId, data === null || data === void 0 ? void 0 : data.roleName, roleId);
                    if (isSameNameRole) {
                        throw new customError_1.CustomError(400, 'Role already exist with the same name');
                    }
                }
                if (role) {
                    if (!(role.isAdminRole || role.isCompanyAdmin)) {
                        if (isFromSameOrg) {
                            yield repositories_1.roleRepository.updateRole({ roleId: roleId, data });
                            yield repositories_1.companyRoleRepository.updateStatus(orgId, 
                            // data.companyId!,
                            roleId, data === null || data === void 0 ? void 0 : data.status);
                        }
                        else {
                            throw new customError_1.CustomError(403, 'Can not update the role of other organization');
                        }
                    }
                    else {
                        throw new customError_1.CustomError(403, 'You can not update the admin role');
                    }
                }
                else {
                    throw new customError_1.CustomError(404, 'No role found');
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
        // For delete the role
        this.deleteRole = (roleId, companyId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield repositories_1.roleRepository.getDetails(roleId);
                const isFromSameOrg = yield repositories_1.roleRepository.checkCompanyAndRole(roleId, companyId);
                const isUsersInRole = yield repositories_1.roleRepository.checkIsUsersInRole(roleId, companyId);
                if (isUsersInRole) {
                    throw new customError_1.CustomError(403, 'Please delete associated user first');
                }
                if (role) {
                    if (!(role.isAdminRole || role.isCompanyAdmin)) {
                        if (isFromSameOrg) {
                            yield repositories_1.roleRepository.deleteCompanyRole(roleId);
                            yield repositories_1.roleRepository.deleteRole(roleId);
                        }
                        else {
                            throw new customError_1.CustomError(403, 'Can not delete the role of other organization');
                        }
                    }
                    else {
                        throw new customError_1.CustomError(403, 'You can not delete the admin role');
                    }
                }
                else {
                    throw new customError_1.CustomError(404, 'No role found');
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
}
exports.default = new RoleService();
