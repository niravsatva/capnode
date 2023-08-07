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
exports.checkPermission = void 0;
const prisma_1 = require("../client/prisma");
// Assuming you have the necessary imports and setup for Prisma and Express
const checkPermission = (req, companyId, requiredPermission) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user; // Assuming you have stored the user ID in the request object
    try {
        const userPermissions = yield prisma_1.prisma.companyRole.findFirst({
            where: {
                userId: id,
                companyId,
            },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        const permissionsList = userPermissions.role.permissions;
        const permission = permissionsList.find((singlePermission) => singlePermission.permissionName === requiredPermission.permissionName);
        if (permission) {
            const permitted = requiredPermission.permission.some((singlePermission) => permission[singlePermission]);
            return permitted || permission['all'];
        }
        else {
            return false;
        }
    }
    catch (err) {
        console.error('Error while checking user permissions:', err);
    }
});
exports.checkPermission = checkPermission;
