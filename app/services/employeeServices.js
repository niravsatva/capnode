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
/* eslint-disable no-mixed-spaces-and-tabs */
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
const quickbooksClient_1 = __importDefault(require("../quickbooksClient/quickbooksClient"));
const repositories_1 = require("../repositories");
const quickbooksServices_1 = __importDefault(require("./quickbooksServices"));
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
class EmployeeServices {
    getEmployees(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = employeeData;
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
    syncEmployeeFirstTime(employeeData) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            // Get all employees from the quickbooks
            const employees = yield quickbooksClient_1.default.getEmployees(employeeData === null || employeeData === void 0 ? void 0 : employeeData.accessToken, employeeData === null || employeeData === void 0 ? void 0 : employeeData.tenantId, employeeData === null || employeeData === void 0 ? void 0 : employeeData.refreshToken);
            let employeeArr = [];
            if (employees && ((_b = (_a = employees === null || employees === void 0 ? void 0 : employees.QueryResponse) === null || _a === void 0 ? void 0 : _a.Employee) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                employeeArr = yield Promise.all((_d = (_c = employees === null || employees === void 0 ? void 0 : employees.QueryResponse) === null || _c === void 0 ? void 0 : _c.Employee) === null || _d === void 0 ? void 0 : _d.map((employee) => __awaiter(this, void 0, void 0, function* () {
                    var _e, _f, _g, _h, _j;
                    const data = {
                        employeeId: employee === null || employee === void 0 ? void 0 : employee.Id,
                        fullName: (_e = employee === null || employee === void 0 ? void 0 : employee.DisplayName) === null || _e === void 0 ? void 0 : _e.replace(' (deleted)', ''),
                        email: (_g = (_f = employee === null || employee === void 0 ? void 0 : employee.PrimaryEmailAddr) === null || _f === void 0 ? void 0 : _f.Address) !== null && _g !== void 0 ? _g : '',
                        phone: (_j = (_h = employee === null || employee === void 0 ? void 0 : employee.PrimaryPhone) === null || _h === void 0 ? void 0 : _h.FreeFormNumber) !== null && _j !== void 0 ? _j : '',
                        active: employee === null || employee === void 0 ? void 0 : employee.Active,
                        companyId: employeeData === null || employeeData === void 0 ? void 0 : employeeData.companyId,
                    };
                    // Update or create employee in db
                    return yield repositories_1.employeeRepository.updateOrCreateEmployee(employee === null || employee === void 0 ? void 0 : employee.Id, employeeData === null || employeeData === void 0 ? void 0 : employeeData.companyId, data);
                })));
            }
            // Update employee last sync date
            yield prisma_1.prisma.company.update({
                where: {
                    id: employeeData === null || employeeData === void 0 ? void 0 : employeeData.companyId,
                },
                data: {
                    employeeLastSyncDate: (0, moment_timezone_1.default)(new Date())
                        .tz('America/Los_Angeles')
                        .format(),
                },
            });
            return employeeArr;
        });
    }
    // Will be called on sync now button
    syncEmployeesByLastSync(companyId, payPeriodId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if company exists or not
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                // DO NOT REMOVE THIS CODE
                // LAMBDA FUNCTION CALL
                // const syncData = await axios.post(
                // 	config.employeeSyncLambdaEndpoint,
                // 	{
                // 		accessToken: authResponse?.accessToken,
                // 		refreshToken: authResponse?.refreshToken,
                // 		tenantID: authResponse?.tenantID,
                // 		companyId: companyId,
                // 		employeeLastSyncDate: companyDetails?.employeeLastSyncDate,
                // 	},
                // 	{
                // 		headers: {
                // 			'x-api-key': config.employeeSyncLambdaApiKey,
                // 			'Content-Type': 'application/json',
                // 		},
                // 	}
                // );
                // return syncData?.data;
                // LAMBDA FUNCTION CALL
                // For local API
                // Get employees by last sync from Quickbooks
                const newEmployees = yield (quickbooksClient_1.default === null || quickbooksClient_1.default === void 0 ? void 0 : quickbooksClient_1.default.getEmployeesByLastSync(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.employeeLastSyncDate, companyId));
                // If new records found
                const employeeArr = [];
                if (((_b = (_a = newEmployees === null || newEmployees === void 0 ? void 0 : newEmployees.QueryResponse) === null || _a === void 0 ? void 0 : _a.Employee) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                    const sectionWithFields = yield configurationRepository_1.default.getConfigurationField(companyId, payPeriodId);
                    const sectionFields = sectionWithFields.reduce((accumulator, section) => {
                        accumulator.push(...section.fields);
                        return accumulator;
                    }, []);
                    for (let i = 0; i < ((_d = (_c = newEmployees === null || newEmployees === void 0 ? void 0 : newEmployees.QueryResponse) === null || _c === void 0 ? void 0 : _c.Employee) === null || _d === void 0 ? void 0 : _d.length); i++) {
                        const employee = (_e = newEmployees === null || newEmployees === void 0 ? void 0 : newEmployees.QueryResponse) === null || _e === void 0 ? void 0 : _e.Employee[i];
                        const employeeData = {
                            employeeId: employee === null || employee === void 0 ? void 0 : employee.Id,
                            fullName: (_f = employee === null || employee === void 0 ? void 0 : employee.DisplayName) === null || _f === void 0 ? void 0 : _f.replace(' (deleted)', ''),
                            email: (_h = (_g = employee === null || employee === void 0 ? void 0 : employee.PrimaryEmailAddr) === null || _g === void 0 ? void 0 : _g.Address) !== null && _h !== void 0 ? _h : '',
                            phone: (_k = (_j = employee === null || employee === void 0 ? void 0 : employee.PrimaryPhone) === null || _j === void 0 ? void 0 : _j.FreeFormNumber) !== null && _k !== void 0 ? _k : '',
                            active: employee === null || employee === void 0 ? void 0 : employee.Active,
                            companyId: companyId,
                        };
                        // Update or create employee in db
                        const result = yield repositories_1.employeeRepository.updateOrCreateEmployee(employee === null || employee === void 0 ? void 0 : employee.Id, companyId, employeeData, sectionFields);
                        employeeArr.push(result);
                    }
                    // employeeArr = await Promise.all(
                    // 	newEmployees?.QueryResponse?.Employee?.map(async (employee: any) => {
                    // 		const employeeData: any = {
                    // 			employeeId: employee?.Id,
                    // 			fullName: employee?.DisplayName?.replace(' (deleted)', ''),
                    // 			email: employee?.PrimaryEmailAddr?.Address ?? '',
                    // 			phone: employee?.PrimaryPhone?.FreeFormNumber ?? '',
                    // 			active: employee?.Active,
                    // 			companyId: companyId,
                    // 		};
                    // 		// Update or create employee in db
                    // 		return await employeeRepository.updateOrCreateEmployee(
                    // 			employee?.Id,
                    // 			companyId,
                    // 			employeeData,
                    // 			sectionFields
                    // 		);
                    // 	})
                    // );
                }
                // Update employee last sync date
                yield prisma_1.prisma.company.update({
                    where: {
                        id: companyId,
                    },
                    data: {
                        employeeLastSyncDate: (0, moment_timezone_1.default)(new Date())
                            .tz('America/Los_Angeles')
                            .format(),
                    },
                });
                return employeeArr;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new EmployeeServices();
