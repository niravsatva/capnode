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
class PermissionRepository {
    constructor() {
        // For get all the permission back for user
        this.getRolePermissions = (id) => __awaiter(this, void 0, void 0, function* () {
            const permissions = yield prisma_1.prisma.permission.findMany({
                where: {
                    roleId: id,
                },
                orderBy: {
                    permissionName: 'asc',
                },
            });
            return permissions;
        });
        // For update the permission
        this.updateRolePermission = (permissions, roleId) => __awaiter(this, void 0, void 0, function* () {
            // "comment"
            yield Promise.all(yield permissions.map((singlePermission) => __awaiter(this, void 0, void 0, function* () {
                const permissionObjCopy = Object.assign({}, singlePermission);
                if (permissionObjCopy.all === true) {
                    permissionObjCopy.delete = true;
                    permissionObjCopy.edit = true;
                    permissionObjCopy.view = true;
                    permissionObjCopy.add = true;
                }
                if (permissionObjCopy.edit === true) {
                    permissionObjCopy.view = true;
                }
                if (permissionObjCopy.delete === true) {
                    permissionObjCopy.view = true;
                }
                if (permissionObjCopy.add === true) {
                    permissionObjCopy.view = true;
                }
                yield prisma_1.prisma.permission.updateMany({
                    where: {
                        id: permissionObjCopy.id,
                        roleId: roleId,
                    },
                    data: {
                        all: permissionObjCopy.all,
                        delete: permissionObjCopy.delete,
                        edit: permissionObjCopy.edit,
                        view: permissionObjCopy.view,
                        add: permissionObjCopy.add,
                    },
                });
            })));
        });
    }
}
exports.default = new PermissionRepository();
