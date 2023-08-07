"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const permissionRoute = (0, express_1.Router)();
//For get the permissions based on the role
permissionRoute.get('/:id', authMiddleware_1.isAuthenticated, controllers_1.permissionController.getAllPermission);
// for update the permission of some role
permissionRoute.post('/update-permission', validators_1.permissionRoleValidationRules, authMiddleware_1.isAuthenticated, controllers_1.permissionController.updatePermission);
exports.default = permissionRoute;
