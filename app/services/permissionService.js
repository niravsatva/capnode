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
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
class PermissionService {
    constructor() {
        this.updatePermission = (companyId, roleId, permissions) => __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield repositories_1.roleRepository.getDetails(roleId);
                const isFromSameOrg = yield repositories_1.roleRepository.checkCompanyAndRole(roleId, companyId);
                if (role) {
                    if (!(role.isAdminRole || role.isCompanyAdmin)) {
                        if (isFromSameOrg) {
                            yield repositories_1.permissionRepository.updateRolePermission(permissions, roleId);
                        }
                        else {
                            throw new customError_1.CustomError(403, 'Can not modify the permission of other company role');
                        }
                    }
                    else {
                        throw new customError_1.CustomError(403, 'You can not modify admin role permission');
                    }
                }
                else {
                    throw new customError_1.CustomError(404, 'No role found');
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new PermissionService();
