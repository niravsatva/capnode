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
const customError_1 = require("../models/customError");
const quickbooksClient_1 = __importDefault(require("../quickbooksClient/quickbooksClient"));
const repositories_1 = require("../repositories");
const quickbooksServices_1 = __importDefault(require("./quickbooksServices"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class EmployeeServices {
    getEmployees(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if company exists or not
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Get all employees by company id
                const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
                return employees;
            }
            catch (err) {
                throw err;
            }
        });
    }
    syncEmployeesByLastSync(companyId) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                // Get employees after sync data
                const newEmployees = yield quickbooksClient_1.default.getEmployeesByLastSync(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.employeeLastSyncDate);
                if (((_b = (_a = newEmployees === null || newEmployees === void 0 ? void 0 : newEmployees.QueryResponse) === null || _a === void 0 ? void 0 : _a.Employee) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                    const promises = (_d = (_c = newEmployees === null || newEmployees === void 0 ? void 0 : newEmployees.QueryResponse) === null || _c === void 0 ? void 0 : _c.Employee) === null || _d === void 0 ? void 0 : _d.map((employee) => {
                        var _a, _b;
                        const employeeData = {
                            employeeId: employee === null || employee === void 0 ? void 0 : employee.Id,
                            fullName: employee === null || employee === void 0 ? void 0 : employee.DisplayName,
                            email: ((_a = employee === null || employee === void 0 ? void 0 : employee.PrimaryEmailAddr) === null || _a === void 0 ? void 0 : _a.Address) || '',
                            phone: ((_b = employee === null || employee === void 0 ? void 0 : employee.PrimaryPhone) === null || _b === void 0 ? void 0 : _b.FreeFormNumber) || '',
                            active: employee === null || employee === void 0 ? void 0 : employee.Active,
                            companyId: companyId,
                        };
                        return repositories_1.employeeRepository.updateOrCreateEmployees(employee === null || employee === void 0 ? void 0 : employee.Id, companyId, employeeData);
                    });
                    const employeeArr = yield Promise.all(promises);
                    // Update Employee last sync date
                    const data = {
                        employeeLastSyncDate: (0, moment_timezone_1.default)(new Date())
                            .tz('America/Los_Angeles')
                            .format(),
                    };
                    yield repositories_1.companyRepository.updateCompany(companyId, data);
                    return employeeArr;
                }
                else {
                    return [];
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new EmployeeServices();
