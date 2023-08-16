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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const quickbooksServices_1 = __importDefault(require("./quickbooksServices"));
class EmployeeServices {
    getEmployees(employeeData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit, search, filter, type, sort, companyId } = employeeData;
                // Check if company exists or not
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Offset
                const offset = (Number(page) - 1) * Number(limit);
                // Conditions for filtering
                const filterConditions = filter
                    ? { status: filter == 'true' ? true : false }
                    : {};
                // Conditions for search
                const searchCondition = search
                    ? {
                        OR: [
                            {
                                firstName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                            {
                                lastName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                            {
                                email: { contains: search, mode: 'insensitive' },
                            },
                        ],
                    }
                    : {};
                // Conditions for sort
                const sortCondition = sort
                    ? {
                        orderBy: {
                            [sort]: type !== null && type !== void 0 ? type : 'asc',
                        },
                    }
                    : {};
                console.log('Details: ', offset, filterConditions, searchCondition, sortCondition);
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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if company exists or not
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                const syncData = yield axios_1.default.post(config_1.default.employeeSyncLambdaEndpoint, {
                    accessToken: authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken,
                    refreshToken: authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken,
                    tenantID: authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID,
                    companyId: companyId,
                    employeeLastSyncDate: companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.employeeLastSyncDate,
                }, {
                    headers: {
                        'x-api-key': config_1.default.employeeSyncLambdaApiKey,
                        'Content-Type': 'application/json',
                    },
                });
                return syncData === null || syncData === void 0 ? void 0 : syncData.data;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new EmployeeServices();
