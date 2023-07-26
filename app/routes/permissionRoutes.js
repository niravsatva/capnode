"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validators_1 = require("../helpers/validators");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const permissionRoute = (0, express_1.Router)();
//For get the permissions based on the role
permissionRoute.get('/:id', authMiddleware_1.isAuthenticated, adminMiddleware_1.isAdminUser, controllers_1.permissionController.getAllPermission);
// for update the permission of some role
permissionRoute.post('/update-permission', validators_1.permissionRoleValidationRules, authMiddleware_1.isAuthenticated, adminMiddleware_1.isAdminUser, controllers_1.permissionController.updatePermission);
exports.default = permissionRoute;
