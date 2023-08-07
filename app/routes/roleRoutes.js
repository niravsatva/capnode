"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const roleRoutes = (0, express_1.Router)();
//For create a single role
roleRoutes.post('/create', validators_1.createRoleValidationRules, controllers_1.rolesController.createRole);
// For get single roles from that company
roleRoutes.get('/single-role/:id', controllers_1.rolesController.getARole);
// For get All the roles from that company
roleRoutes.get('/organization-roles/:id', controllers_1.rolesController.getAllRoles);
// for update the some role
roleRoutes.post('/update-role', validators_1.updateRoleValidationRules, controllers_1.rolesController.updateRole);
// for delete the role
roleRoutes.delete('/', validators_1.deleteRoleValidationRules, controllers_1.rolesController.deleteRole);
exports.default = roleRoutes;
