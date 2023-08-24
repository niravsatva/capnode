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
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const employeeServices_1 = __importDefault(require("../services/employeeServices"));
class EmployeeController {
    getAllEmployees(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const { page = 1, limit = 10, search, filter, type, sort } = req.query;
                const companyId = req.body.companyId;
                // Get all employees
                const employees = yield employeeServices_1.default.getEmployees({
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                    filter: String(filter),
                    type: String(type),
                    sort: String(sort),
                    companyId: companyId,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Employees fetched successfully', employees);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Sync lambda call
    syncEmployees(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get new employees
                const updatedEmployees = yield employeeServices_1.default.syncEmployeesByLastSync(companyId);
                console.log('Updated employees: ', updatedEmployees);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Employees synced successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new EmployeeController();
