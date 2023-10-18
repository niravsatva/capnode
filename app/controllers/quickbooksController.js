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
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const customError_1 = require("../models/customError");
const quickbooksAuthClient_1 = __importDefault(require("../quickbooksClient/quickbooksAuthClient"));
const quickbooksClient_1 = __importDefault(require("../quickbooksClient/quickbooksClient"));
const repositories_1 = require("../repositories");
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
const employeeServices_1 = __importDefault(require("../services/employeeServices"));
const quickbooksServices_1 = __importDefault(require("../services/quickbooksServices"));
const timeActivityServices_1 = __importDefault(require("../services/timeActivityServices"));
const prisma_1 = require("../client/prisma");
const moment_1 = __importDefault(require("moment"));
const utils_1 = require("../utils/utils");
// import axios from 'axios';
// import timeActivityServices from '../services/timeActivityServices';
class QuickbooksController {
    // Get Quickbooks Auth URI
    getQuickbooksAuthUri(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
                // const subId = req.body.subId;
                const qboAuthorizeUrl = yield quickbooksAuthClient_1.default.authorizeUri(subId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Quickbooks AuthUri retrieved successfully', qboAuthorizeUrl);
            }
            catch (err) {
                console.log('Err: ', err);
                next(err);
            }
        });
    }
    // Quickbooks callback
    quickbooksCallback(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get company id from body - only for reconnecting company
                const companyId = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.companyId;
                // Fetch URL
                const url = String((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.url);
                const currentUrl = new URL((_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.url);
                const searchParams = currentUrl === null || currentUrl === void 0 ? void 0 : currentUrl.searchParams;
                const userId = searchParams.get('state');
                const authToken = yield quickbooksAuthClient_1.default.createAuthToken(url);
                const qboCompanyInfo = yield quickbooksClient_1.default.getCompanyInfo(authToken.access_token, authToken.realmId, authToken.refresh_token);
                let finalCompanyDetails;
                if (companyId != 'undefined' && companyId !== null) {
                    // checking is user permitted
                    const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                        permissionName: 'Integrations',
                        permission: ['edit'],
                    });
                    if (!isPermitted) {
                        throw new customError_1.CustomError(403, 'You are not authorized');
                    }
                    const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                    if (!companyDetails) {
                        const error = new customError_1.CustomError(404, 'Company not found');
                        throw error;
                    }
                    if ((companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantID) !== authToken.realmId) {
                        const error = new customError_1.CustomError(401, 'Can not connect this company');
                        throw error;
                    }
                    finalCompanyDetails = yield repositories_1.companyRepository.updateCompany(companyId, {
                        accessToken: authToken.access_token,
                        refreshToken: authToken.refresh_token,
                        isConnected: true,
                        tenantID: authToken.realmId,
                        fiscalYear: qboCompanyInfo === null || qboCompanyInfo === void 0 ? void 0 : qboCompanyInfo.FiscalYearStartMonth,
                    });
                    // const syncData = await axios.post(
                    // 	'https://vwarjgvafl.execute-api.us-east-1.amazonaws.com/default/cost-allocation-pro-dev-employeeDump',
                    // 	{
                    // 		accessToken: authToken.access_token,
                    // 		refreshToken: authToken.refresh_token,
                    // 		tenantID: authToken.realmId,
                    // 		companyId: companyId,
                    // 		employeeLastSyncDate: companyDetails?.employeeLastSyncDate,
                    // 	},
                    // 	{
                    // 		headers: {
                    // 			'x-api-key': 'CRkwakE0jkO3y4uNIBVZ8LeqJfK7rtHaXTR9NkXg',
                    // 			'Content-Type': 'application/json',
                    // 		},
                    // 	}
                    // );
                    // console.log('Sync data update: ', syncData);
                }
                else {
                    // For first time company integration
                    // Check if the same company is already connected
                    const isAlreadyConnected = yield repositories_1.companyRepository.getCompanyByTenantId(authToken.realmId);
                    if (isAlreadyConnected) {
                        const error = new customError_1.CustomError(404, 'Company is already connected');
                        throw error;
                    }
                    const data = {
                        tenantID: authToken.realmId,
                        tenantName: qboCompanyInfo === null || qboCompanyInfo === void 0 ? void 0 : qboCompanyInfo.CompanyName,
                        accessToken: authToken.access_token,
                        refreshToken: authToken.refresh_token,
                        accessTokenUTCDate: new Date(),
                        isConnected: true,
                        fiscalYear: qboCompanyInfo === null || qboCompanyInfo === void 0 ? void 0 : qboCompanyInfo.FiscalYearStartMonth,
                    };
                    finalCompanyDetails = yield repositories_1.companyRepository.create(data);
                    yield (repositories_1.companyRepository === null || repositories_1.companyRepository === void 0 ? void 0 : repositories_1.companyRepository.connectCompany(userId, finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id));
                    yield configurationRepository_1.default.createDefaultConfiguration(finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id);
                    // DO NOT REMOVE THIS CODE
                    // LAMBDA FUNCTION CALL
                    // const syncData = await axios.post(
                    // 	config.employeeSyncLambdaEndpoint,
                    // 	{
                    // 		accessToken: authToken.access_token,
                    // 		refreshToken: authToken.refresh_token,
                    // 		tenantID: authToken.realmId,
                    // 		companyId: finalCompanyDetails?.id,
                    // 	},
                    // 	{
                    // 		headers: {
                    // 			'x-api-key': config.employeeSyncLambdaApiKey,
                    // 			'Content-Type': 'application/json',
                    // 		},
                    // 	}
                    // );
                    // const syncTimeActivities = await axios.post(
                    // 	config.timeactivitySyncLambdaEndpoint,
                    // 	{
                    // 		accessToken: authToken.access_token,
                    // 		refreshToken: authToken.refresh_token,
                    // 		tenantID: authToken.realmId,
                    // 		companyId: finalCompanyDetails?.id,
                    // 	},
                    // 	{
                    // 		headers: {
                    // 			'x-api-key': config.timeactivitySyncLambdaApiKey,
                    // 			'Content-Type': 'application/json',
                    // 		},
                    // 	}
                    // );
                    // LAMBDA FUNCTION CALL
                    // Do not remove API for employee sync
                    const syncData = yield employeeServices_1.default.syncEmployeeFirstTime({
                        accessToken: authToken === null || authToken === void 0 ? void 0 : authToken.access_token,
                        refreshToken: authToken === null || authToken === void 0 ? void 0 : authToken.refresh_token,
                        tenantId: authToken === null || authToken === void 0 ? void 0 : authToken.realmId,
                        companyId: finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id,
                    });
                    // Do not remove API for employee sync
                    // Do not remove API for timeativity sync
                    const syncTimeActivities = yield timeActivityServices_1.default.lambdaSyncFunction({
                        accessToken: authToken === null || authToken === void 0 ? void 0 : authToken.access_token,
                        refreshToken: authToken === null || authToken === void 0 ? void 0 : authToken.refresh_token,
                        tenantId: authToken === null || authToken === void 0 ? void 0 : authToken.realmId,
                        companyId: finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id,
                    });
                    // Do not remove API for timeativity sync
                    // Update employee last sync date
                    yield prisma_1.prisma.company.update({
                        where: {
                            id: finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id,
                        },
                        data: {
                            employeeLastSyncDate: (0, moment_1.default)(new Date())
                                .tz('America/Los_Angeles')
                                .format(),
                        },
                    });
                    // Update employee last sync date
                    yield prisma_1.prisma.company.update({
                        where: {
                            id: finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id,
                        },
                        data: {
                            timeActivitiesLastSyncDate: (0, moment_1.default)(new Date())
                                .tz('America/Los_Angeles')
                                .format(),
                        },
                    });
                    const fields = yield configurationRepository_1.default.initialFieldSectionCreate(finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id);
                    const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id);
                    const sectionWithFields = yield configurationRepository_1.default.getConfigurationField(finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id);
                    const sectionFields = sectionWithFields.reduce((accumulator, section) => {
                        accumulator.push(...section.fields);
                        return accumulator;
                    }, []);
                    const values = yield repositories_1.employeeCostRepository.createInitialValues(employees, sectionFields, finalCompanyDetails === null || finalCompanyDetails === void 0 ? void 0 : finalCompanyDetails.id);
                    // await employeeServices.syncEmployeesByLastSync(companyId);
                }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company connected successfully', finalCompanyDetails);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Disconnect Quickbooks company
    quickbooksDisconnect(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyId = req.body.companyId;
                // checking is user permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Integrations',
                    permission: ['delete'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                yield quickbooksAuthClient_1.default.revokeToken(companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.refreshToken);
                yield repositories_1.companyRepository.updateCompany(companyId, {
                    isConnected: false,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Quickbooks company disconnected successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Update Quickbooks company status - sync On/Off
    updateCompanyStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const { companyId, status } = req.body;
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const updatedCompanyStatus = yield repositories_1.companyRepository.updateStatus(companyId, status);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Status updated successfully', updatedCompanyStatus);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get All Employees
    getAllQBEmployees(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                // Get All Employees From Quickbooks
                const allEmployees = yield quickbooksClient_1.default.getEmployees(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'All employees fetched ', (_a = allEmployees === null || allEmployees === void 0 ? void 0 : allEmployees.QueryResponse) === null || _a === void 0 ? void 0 : _a.Employee);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get All Accounts
    getAllAccounts(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                    // Get All Accounts From Quickbooks
                    const accounts = yield quickbooksClient_1.default.getAllAccounts(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                    // Accounts with account number
                    const finalAccounts = (_b = (_a = accounts === null || accounts === void 0 ? void 0 : accounts.QueryResponse) === null || _a === void 0 ? void 0 : _a.Account) === null || _b === void 0 ? void 0 : _b.map((account) => {
                        if (account === null || account === void 0 ? void 0 : account.AcctNum) {
                            return Object.assign(Object.assign({}, account), { Name: `${account === null || account === void 0 ? void 0 : account.AcctNum} - ${account === null || account === void 0 ? void 0 : account.Name}` });
                        }
                        else {
                            return account;
                        }
                    });
                    const data = (0, utils_1.sortArray)(finalAccounts, 'asc', 'Name');
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'All accounts fetched successfully', data);
                }
                else {
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company status is not active');
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get All Customers
    getAllCustomer(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                    // Get All Customers from Quickbooks
                    const customers = yield quickbooksClient_1.default.getAllCustomers(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                    yield prisma_1.prisma.company.update({
                        where: {
                            id: companyId,
                        },
                        data: {
                            customerLastSyncDate: (0, moment_1.default)(new Date())
                                .tz('America/Los_Angeles')
                                .format(),
                        },
                    });
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'All customers fetched successfully', (_a = customers === null || customers === void 0 ? void 0 : customers.QueryResponse) === null || _a === void 0 ? void 0 : _a.Customer);
                }
                else {
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company status is not active');
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get All Classes
    getAllClasses(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                    // Get All Classes From Quickbooks
                    const classes = yield quickbooksClient_1.default.getAllClasses(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                    const finalClasses = (_b = (_a = classes === null || classes === void 0 ? void 0 : classes.QueryResponse) === null || _a === void 0 ? void 0 : _a.Class) === null || _b === void 0 ? void 0 : _b.filter((item) => (item === null || item === void 0 ? void 0 : item.SubClass) === true);
                    yield prisma_1.prisma.company.update({
                        where: {
                            id: companyId,
                        },
                        data: {
                            classLastSyncDate: (0, moment_1.default)(new Date())
                                .tz('America/Los_Angeles')
                                .format(),
                        },
                    });
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'All classes fetched successfully', finalClasses);
                }
                else {
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company status is not active');
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get Company Info
    getCompanyInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                // Get Company Details From Quickbooks
                const qboCompanyInfo = yield quickbooksClient_1.default.getCompanyInfo(authResponse.accessToken, authResponse.tenantID, authResponse.refreshToken);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company details fetched successfully', qboCompanyInfo);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Get All TimeActivities
    getAllTimeActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company id
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                // Get Company Details From Quickbooks
                const qboCompanyInfo = yield quickbooksClient_1.default.getAllTimeActivities(authResponse.accessToken, authResponse.tenantID, authResponse.refreshToken);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time activities fetched successfully', qboCompanyInfo);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new QuickbooksController();
