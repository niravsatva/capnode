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
exports.companyValidation = void 0;
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
const logger_1 = require("../utils/logger");
const client_lambda_1 = require("@aws-sdk/client-lambda");
const aws_1 = require("../config/aws");
const authServices_1 = __importDefault(require("../services/authServices"));
// import axios from 'axios';
// import timeActivityServices from '../services/timeActivityServices';
const client = new client_lambda_1.LambdaClient(aws_1.awsConfig);
const companyValidation = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!companyId) {
        throw new customError_1.CustomError(400, 'Company id is required');
    }
    const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
    if (!companyDetails) {
        throw new customError_1.CustomError(400, 'Company not found');
    }
});
exports.companyValidation = companyValidation;
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
                logger_1.logger.error('Err: ', err);
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
                if (qboCompanyInfo['Country'] !== 'US') {
                    const error = new customError_1.CustomError(400, 'Only US company can be connected!');
                    throw error;
                }
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
                        const error = new customError_1.CustomError(400, 'Company not found');
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
                }
                else {
                    // For first time company integration
                    // Check if the same company is already connected
                    const isAlreadyConnected = yield repositories_1.companyRepository.getCompanyByTenantId(authToken.realmId);
                    if (isAlreadyConnected) {
                        const getSubscriptionDetails = yield prisma_1.prisma.subscription.findFirst({
                            where: {
                                companyId: isAlreadyConnected.id
                            }
                        });
                        if (getSubscriptionDetails && getSubscriptionDetails.status === 'live') {
                            throw new customError_1.CustomError(400, 'Company is already connected');
                        }
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
                    // Lambda event
                    // const input: any = {
                    // 	// InvocationRequest
                    // 	FunctionName: 'cost-allocation-pro-dev-timeLogsDump',
                    // 	InvocationType: 'Event',
                    // 	Payload: JSON.stringify({
                    // 		accessToken: authToken.access_token,
                    // 		refreshToken: authToken.refresh_token,
                    // 		tenantID: authToken.realmId,
                    // 		companyId: finalCompanyDetails?.id,
                    // 	}),
                    // };
                    // const command = new InvokeCommand(input);
                    // await client.send(command);
                    // Do not remove API for timeativity sync
                    timeActivityServices_1.default.lambdaSyncFunction({
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
                    // await prisma.company.update({
                    // 	where: {
                    // 		id: finalCompanyDetails?.id,
                    // 	},
                    // 	data: {
                    // 		timeActivitiesLastSyncDate: moment(new Date())
                    // 			.tz('America/Los_Angeles')
                    // 			.format(),
                    // 	},
                    // });
                    //NOTE: Now we will create all default entries when first pay period will be create.
                    // const fields = await configurationRepository.initialFieldSectionCreate(
                    // 	finalCompanyDetails?.id
                    // );
                    // const employees = await employeeRepository.getAllEmployeesByCompanyId(
                    // 	finalCompanyDetails?.id
                    // );
                    // const sectionWithFields =
                    // 	await configurationRepository.getConfigurationField(
                    // 		finalCompanyDetails?.id,
                    // 		''
                    // 	);
                    // const sectionFields = sectionWithFields.reduce(
                    // 	(accumulator: any, section) => {
                    // 		accumulator.push(...section.fields);
                    // 		return accumulator;
                    // 	},
                    // 	[]
                    // );
                    // const values = await employeeCostRepository.createInitialValues(
                    // 	employees,
                    // 	sectionFields,
                    // 	finalCompanyDetails?.id
                    // );
                    // await employeeServices.syncEmployeesByLastSync(companyId);
                }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company connected successfully', finalCompanyDetails);
            }
            catch (err) {
                next(err);
            }
        });
    }
    //  Get Quickbooks Auth URI for SSO
    getQuickbooksSSOAuthUri(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const qboAuthorizeUrl = yield quickbooksAuthClient_1.default.ssoAuthorizeUri('');
                // const qboAuthorizeUrl = await quickbooksAuthClient.authorizeUri('');
                console.log('ABO : ', qboAuthorizeUrl);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Quickbooks AuthUri retrieved successfully', qboAuthorizeUrl);
            }
            catch (err) {
                logger_1.logger.error('Err: ', err);
                next(err);
            }
        });
    }
    // Get Quickbooks Callback for SSO
    quickbooksSSOCallback(req, res, next) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch URL
                const url = String((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.url);
                const currentUrl = new URL((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.url);
                const machineId = (_c = req.body) === null || _c === void 0 ? void 0 : _c.machineId;
                const authToken = yield quickbooksAuthClient_1.default.ssoCreateAuthToken(url);
                const qboUserInfo = yield quickbooksClient_1.default.GetUserinfo(authToken.access_token);
                // Check if user is already in User table
                const user = yield repositories_1.userRepository.getByEmail(qboUserInfo.email);
                if (user) {
                    const { accessToken, refreshToken, user: userData, } = yield authServices_1.default.ssoLogin(user, machineId);
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User logged in successfully', {
                        id: user.id,
                        email: user.email,
                        firstName: user === null || user === void 0 ? void 0 : user.firstName,
                        lastName: user === null || user === void 0 ? void 0 : user.lastName,
                        phone: user === null || user === void 0 ? void 0 : user.phone,
                        status: user === null || user === void 0 ? void 0 : user.status,
                        accessToken,
                        refreshToken,
                    });
                    // const userWithNullCompany =
                    // 	await companyRoleRepository.getRecordWithNullCompanyId(user.id);
                    // if (userWithNullCompany.length > 0) {
                    // 	const superAdminSubscription = await prisma.subscription.findFirst({
                    // 		where: {
                    // 			userId: user.id,
                    // 		},
                    // 	});
                    // 	console.log(superAdminSubscription);
                    // 	if (
                    // 		superAdminSubscription &&
                    // 		(!superAdminSubscription.status ||
                    // 			superAdminSubscription.status != 'live')
                    // 	) {
                    // 		throw new CustomError(
                    // 			400,
                    // 			'You do not have any active subscription currently'
                    // 		);
                    // 	}
                    // 	const qboCompanyInfo = await quickbooksClient.getCompanyInfo(
                    // 		authToken.access_token,
                    // 		authToken.realmId,
                    // 		authToken.refresh_token
                    // 	);
                    // 	if (qboCompanyInfo['Country'] !== 'US') {
                    // 		const error = new CustomError(
                    // 			400,
                    // 			'Only US company can be connected!'
                    // 		);
                    // 		throw error;
                    // 	}
                    // 	const isAlreadyConnected =
                    // 		await companyRepository.getCompanyByTenantId(authToken.realmId);
                    // 	if (isAlreadyConnected) {
                    // 		const error = new CustomError(400, 'Company is already connected');
                    // 		throw error;
                    // 	}
                    // 	const data = {
                    // 		tenantID: authToken.realmId,
                    // 		tenantName: qboCompanyInfo?.CompanyName,
                    // 		accessToken: authToken.access_token,
                    // 		refreshToken: authToken.refresh_token,
                    // 		accessTokenUTCDate: new Date(),
                    // 		isConnected: true,
                    // 		fiscalYear: qboCompanyInfo?.FiscalYearStartMonth,
                    // 	};
                    // 	const finalCompanyDetails = await companyRepository.create(data);
                    // 	await companyRepository?.connectCompany(
                    // 		user.id,
                    // 		finalCompanyDetails?.id
                    // 	);
                    // 	const syncData = await employeeServices.syncEmployeeFirstTime({
                    // 		accessToken: authToken?.access_token,
                    // 		refreshToken: authToken?.refresh_token,
                    // 		tenantId: authToken?.realmId,
                    // 		companyId: finalCompanyDetails?.id,
                    // 	});
                    // 	timeActivityServices.lambdaSyncFunction({
                    // 		accessToken: authToken?.access_token,
                    // 		refreshToken: authToken?.refresh_token,
                    // 		tenantId: authToken?.realmId,
                    // 		companyId: finalCompanyDetails?.id,
                    // 	});
                    // 	const {
                    // 		accessToken,
                    // 		refreshToken,
                    // 		user: userData,
                    // 	} = await authServices.ssoLogin(user, machineId);
                    // 	return DefaultResponse(res, 200, 'User logged in successfully', {
                    // 		id: user.id,
                    // 		email: user.email,
                    // 		firstName: user?.firstName,
                    // 		lastName: user?.lastName,
                    // 		phone: user?.phone,
                    // 		status: user?.status,
                    // 		accessToken,
                    // 		refreshToken,
                    // 	});
                    // } else {
                    // 	// const adminRole: any = await prisma.role.findFirst({
                    // 	// 	where: {
                    // 	// 		roleName: 'Company Admin',
                    // 	// 	},
                    // 	// });
                    // 	const companyRoleData = await prisma.companyRole.findMany({
                    // 		where: {
                    // 			userId: user.id,
                    // 		},
                    // 		include:  {
                    // 			company: true
                    // 		}
                    // 	});
                    // 	// companyData?.tenantID !== authToken.realmId
                    // 	if (!companyRoleData.some((cRole) => cRole.company?.tenantID === authToken.realmId)) {
                    // 		throw new CustomError(
                    // 			400,
                    // 			'This company is not connected to your account'
                    // 		);
                    // 	}
                    // 	const {
                    // 		accessToken,
                    // 		refreshToken,
                    // 		user: userData,
                    // 	} = await authServices.ssoLogin(user, machineId);
                    // 	return DefaultResponse(res, 200, 'User logged in successfully', {
                    // 		id: user.id,
                    // 		email: user.email,
                    // 		firstName: user?.firstName,
                    // 		lastName: user?.lastName,
                    // 		phone: user?.phone,
                    // 		status: user?.status,
                    // 		accessToken,
                    // 		refreshToken,
                    // 	});
                    // }
                }
                else {
                    throw new customError_1.CustomError(400, 'You need to buy zoho subscription to register in CostAllocation Pro.');
                }
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
    // Get Closing date
    getClosingDateList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyId = req.query.companyId;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(400, 'Company not found');
                }
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                const closingDateList = yield quickbooksClient_1.default.getClosingDate(authResponse.accessToken, authResponse.tenantID, authResponse.refreshToken, companyId, req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Closing dates fetched successfully', closingDateList);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Create Chart Of Account
    createChartOfAccount(req, res, next) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyId = req.body.companyId;
                const { accountType = 'Expense', currencyValue = 'USD', accountNum, accountName, detailType = 'Travel', } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                (0, exports.companyValidation)(companyId);
                const data = {
                    accountName: accountName,
                    accountNum: accountNum,
                    detailType: detailType,
                    accountType: accountType,
                    currencyValue: currencyValue,
                };
                if (!detailType) {
                    delete data['detailType'];
                }
                if (!accountNum) {
                    delete data['accountNum'];
                }
                // Get access token
                const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
                const closingDateList = yield quickbooksClient_1.default.createChartOfAccount(authResponse.accessToken, authResponse.tenantID, authResponse.refreshToken, data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Closing dates fetched successfully', closingDateList);
            }
            catch (error) {
                let customErrorMessage = 'Error while creating new Chart Of Account';
                if (error &&
                    (error === null || error === void 0 ? void 0 : error.Fault) &&
                    ((_a = error.Fault) === null || _a === void 0 ? void 0 : _a.Error) &&
                    error.Fault.Error.length) {
                    if (((_c = (_b = error === null || error === void 0 ? void 0 : error.Fault) === null || _b === void 0 ? void 0 : _b.Error[0]) === null || _c === void 0 ? void 0 : _c.code) === '6000') {
                        customErrorMessage =
                            'Another account is already using this account number. Please use another account number.';
                    }
                    else {
                        customErrorMessage = `${(_e = (_d = error === null || error === void 0 ? void 0 : error.Fault) === null || _d === void 0 ? void 0 : _d.Error[0]) === null || _e === void 0 ? void 0 : _e.Message}: ${(_g = (_f = error === null || error === void 0 ? void 0 : error.Fault) === null || _f === void 0 ? void 0 : _f.Error[0]) === null || _g === void 0 ? void 0 : _g.Detail}`;
                    }
                    const newErr = new customError_1.CustomError(400, customErrorMessage);
                    next(newErr);
                }
                else {
                    next(error);
                }
            }
        });
    }
    getCustomerOptions(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Check validation for company id
            (0, validationHelper_1.checkValidation)(req);
            const companyId = req.body.companyId;
            // Get access token
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                // Get All Customers from Quickbooks
                const customers = yield quickbooksClient_1.default.getAllCustomers(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                const formattedCustomers = (_b = (_a = customers === null || customers === void 0 ? void 0 : customers.QueryResponse) === null || _a === void 0 ? void 0 : _a.Customer) === null || _b === void 0 ? void 0 : _b.map((customer) => {
                    return {
                        value: customer.Id,
                        Id: customer.Id,
                        parentId: (customer === null || customer === void 0 ? void 0 : customer.ParentRef) ? customer === null || customer === void 0 ? void 0 : customer.ParentRef.value : null,
                        title: customer.DisplayName,
                    };
                });
                const finalCustomers = quickbooksServices_1.default.buildHierarchy(formattedCustomers, null);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Customers fetched successfully', [
                    { value: '', title: 'Select Customer', children: [] },
                    ...finalCustomers,
                ]);
            }
        });
    }
}
exports.default = new QuickbooksController();
