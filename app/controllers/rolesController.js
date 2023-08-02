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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repositories_1 = require("../repositories");
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const roleService_1 = __importDefault(require("../services/roleService"));
const validationHelper_1 = require("../helpers/validationHelper");
class RolesController {
    constructor() {
        //For create a single role
        this.createRole = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { orgId, roleDescription, roleName, isAdminRole = false, } = req.body;
                const createdRole = yield roleService_1.default.createRole({
                    orgId,
                    roleDescription,
                    roleName,
                    isAdminRole,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'Roles created successfully', createdRole);
            }
            catch (error) {
                next(error);
            }
        });
        // For get All the roles from that company
        this.getAllRoles = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { page = 1, limit = 10, search, filter, type, sort } = req.query;
                const roles = yield roleService_1.default.getAllRoles(id, Number(page), Number(limit), search, filter, type, sort);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Roles find successful', roles);
            }
            catch (error) {
                next(error);
            }
        });
        // For get single roles from that company
        this.getARole = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const role = yield repositories_1.roleRepository.getDetails(id);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Role find successful', role);
            }
            catch (error) {
                next(error);
            }
        });
        // for update the some role
        this.updateRole = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const data = req.body;
                yield roleService_1.default.updateUserRole(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Role updated successfully');
            }
            catch (error) {
                next(error);
            }
        });
        // for delete the role
        this.deleteRole = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { orgId, roleId } = req.body;
                yield roleService_1.default.deleteRole(roleId, orgId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Role deleted successfully');
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new RolesController();
