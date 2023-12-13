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
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const config_1 = __importDefault(require("../../config"));
const data_1 = require("../constants/data");
const prisma_1 = require("../client/prisma");
const enum_1 = require("../enum");
const axios_1 = __importDefault(require("axios"));
/* eslint-disable @typescript-eslint/no-var-requires */
const QuickBooks = require('node-quickbooks');
class QuickbooksClient {
    getCompanyInfo(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                qbo.getCompanyInfo(realmId, function (err, response) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(response);
                        }
                    });
                });
            });
        });
    }
    GetUserinfo(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(config_1.default.quickbooksUserInfoUri, {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        });
    }
    getEmployees(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                qbo.findEmployees([{ field: 'Active', value: [true, false], operator: 'IN' }], 
                // [{ field: 'fetchAll', value: true }],
                function (err, response) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(response);
                        }
                    });
                });
            });
        });
    }
    getAllAccounts(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.findAccounts([
                        {
                            field: 'AccountType',
                            value: ['Expense', 'Other Expense'],
                            operator: 'IN',
                        },
                        { field: 'fetchAll', value: true },
                        { field: 'asc', value: 'Name' },
                    ], function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    getAllClasses(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.findClasses([
                        { field: 'fetchAll', value: true },
                        { field: 'Active', value: true },
                        { field: 'asc', value: 'Name' },
                    ], function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    getAllCustomers(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.findCustomers([
                        { field: 'fetchAll', value: true },
                        { field: 'asc', value: 'GivenName' },
                        { field: 'Active', value: true },
                    ], function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    getAllTimeActivities(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.findTimeActivities([
                        // { field: 'TxnDate', value: '2014-12-01', operator: '>' },
                        // { field: 'TxnDate', value: '2014-12-03', operator: '<' },
                        // { field: 'limit', value: 5 },
                        { field: 'fetchAll', value: true },
                    ], function (err, timeActivities) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(timeActivities);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get employees by last sync date
    getEmployeesByLastSync(accessToken, realmId, refreshToken, lastSyncDate, companyId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            try {
                const employeeData = yield new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.findEmployees([
                        { field: 'Active', value: [true, false], operator: 'IN' },
                        {
                            field: 'MetaData.LastUpdatedTime',
                            value: (0, moment_timezone_1.default)(lastSyncDate).tz('America/Los_Angeles').format(),
                            operator: '>=',
                        },
                        // { field: 'fetchAll', value: true },
                    ], function (err, timeActivities) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(timeActivities);
                            }
                        });
                    });
                });
                const duration = Date.now() - start;
                yield prisma_1.prisma.syncLogs.create({
                    data: {
                        moduleName: enum_1.QBOModules.EMPLOYEE,
                        status: enum_1.SyncLogsStatus.SUCCESS,
                        message: `New ${((_b = (_a = employeeData === null || employeeData === void 0 ? void 0 : employeeData.QueryResponse) === null || _a === void 0 ? void 0 : _a.Employee) === null || _b === void 0 ? void 0 : _b.length)
                            ? (_d = (_c = employeeData === null || employeeData === void 0 ? void 0 : employeeData.QueryResponse) === null || _c === void 0 ? void 0 : _c.Employee) === null || _d === void 0 ? void 0 : _d.length
                            : 0} employees synced successfully in ${Number(duration) / 1000} seconds.`,
                        companyId: companyId,
                    },
                });
                return employeeData;
            }
            catch (error) {
                let customErrorMessage = 'Error while posting journal in Quickbooks';
                if (error &&
                    (error === null || error === void 0 ? void 0 : error.Fault) &&
                    ((_e = error.Fault) === null || _e === void 0 ? void 0 : _e.Error) &&
                    error.Fault.Error.length) {
                    customErrorMessage = `${(_g = (_f = error === null || error === void 0 ? void 0 : error.Fault) === null || _f === void 0 ? void 0 : _f.Error[0]) === null || _g === void 0 ? void 0 : _g.Message}: ${(_j = (_h = error === null || error === void 0 ? void 0 : error.Fault) === null || _h === void 0 ? void 0 : _h.Error[0]) === null || _j === void 0 ? void 0 : _j.Detail}`;
                }
                yield prisma_1.prisma.syncLogs.create({
                    data: {
                        moduleName: enum_1.QBOModules.EMPLOYEE,
                        status: enum_1.SyncLogsStatus.FAILURE,
                        message: customErrorMessage,
                        companyId: companyId,
                    },
                });
                throw error;
            }
        });
    }
    // Get time activities by last sync date
    getTimeActivitiesByLastSync(accessToken, realmId, refreshToken, lastSyncDate, companyId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            try {
                const timeActivityData = yield new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.findTimeActivities([
                        {
                            field: 'MetaData.LastUpdatedTime',
                            value: (0, moment_timezone_1.default)(lastSyncDate).tz('America/Los_Angeles').format(),
                            operator: '>=',
                        },
                        { field: 'fetchAll', value: true },
                    ], function (err, timeActivities) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(timeActivities);
                            }
                        });
                    });
                });
                const duration = Date.now() - start;
                yield prisma_1.prisma.syncLogs.create({
                    data: {
                        moduleName: enum_1.QBOModules.TIME_ACTIVITY,
                        status: enum_1.SyncLogsStatus.SUCCESS,
                        message: `New ${((_b = (_a = timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.QueryResponse) === null || _a === void 0 ? void 0 : _a.TimeActivity) === null || _b === void 0 ? void 0 : _b.length)
                            ? (_d = (_c = timeActivityData === null || timeActivityData === void 0 ? void 0 : timeActivityData.QueryResponse) === null || _c === void 0 ? void 0 : _c.TimeActivity) === null || _d === void 0 ? void 0 : _d.length
                            : 0} time activities synced successfully in ${Number(duration) / 1000} seconds.`,
                        companyId: companyId,
                    },
                });
                return timeActivityData;
            }
            catch (error) {
                let customErrorMessage = 'Error while posting journal in Quickbooks';
                if (error &&
                    (error === null || error === void 0 ? void 0 : error.Fault) &&
                    ((_e = error.Fault) === null || _e === void 0 ? void 0 : _e.Error) &&
                    error.Fault.Error.length) {
                    customErrorMessage = `${(_g = (_f = error === null || error === void 0 ? void 0 : error.Fault) === null || _f === void 0 ? void 0 : _f.Error[0]) === null || _g === void 0 ? void 0 : _g.Message}: ${(_j = (_h = error === null || error === void 0 ? void 0 : error.Fault) === null || _h === void 0 ? void 0 : _h.Error[0]) === null || _j === void 0 ? void 0 : _j.Detail}`;
                }
                yield prisma_1.prisma.syncLogs.create({
                    data: {
                        moduleName: enum_1.QBOModules.EMPLOYEE,
                        status: enum_1.SyncLogsStatus.FAILURE,
                        message: customErrorMessage,
                        companyId: companyId,
                    },
                });
                throw error;
            }
        });
    }
    // Get closing date
    getClosingDate(accessToken, realmId, refreshToken, companyId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const date = yield new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.getPreferences(function (err, response) {
                        var _a;
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                const date = (_a = response === null || response === void 0 ? void 0 : response.AccountingInfoPrefs) === null || _a === void 0 ? void 0 : _a.BookCloseDate;
                                resolve(date);
                            }
                        });
                    });
                });
                if (query.syncLogs) {
                    const start = Date.now();
                    const duration = Date.now() - start;
                    yield prisma_1.prisma.syncLogs.create({
                        data: {
                            moduleName: enum_1.QBOModules.CLOSING_DATE,
                            status: enum_1.SyncLogsStatus.SUCCESS,
                            message: `New book closing date ${date} synced successfully in ${Number(duration) / 1000} seconds.`,
                            companyId: companyId,
                        },
                    });
                }
                return date;
            }
            catch (err) {
                throw err;
            }
        });
    }
    createJournalEntry(accessToken, realmId, refreshToken, journalData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.createJournalEntry(journalData, function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    updateJournalEntry(accessToken, realmId, refreshToken, journalData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.updateJournalEntry(journalData, function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    getJournal(accessToken, realmId, refreshToken, journalId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.getJournalEntry(journalId, function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    uploadFile(accessToken, realmId, refreshToken, fileName, fileType, fileData, entityName, entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.upload(fileName, fileType, fileData, entityName, entityId, function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    createChartOfAccount(accessToken, realmId, refreshToken, accountData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { accountName, currencyValue, accountType, accountNum, detailType, } = accountData;
                const currency = data_1.supportedQBOCurrencies.find((singleCurrency) => singleCurrency.value === currencyValue);
                const data = {
                    Name: accountName,
                    AccountType: accountType,
                    CurrencyRef: {
                        value: currency === null || currency === void 0 ? void 0 : currency.value,
                        name: currency === null || currency === void 0 ? void 0 : currency.name,
                    },
                };
                if (accountNum) {
                    data['AcctNum'] = accountData.accountNum;
                }
                if (detailType) {
                    data['SubAccount'] = true;
                    data['AccountSubType'] = detailType;
                }
                const account = yield new Promise((resolve, reject) => {
                    const qbo = new QuickBooks(config_1.default.quickbooksClientId, config_1.default.quickbooksClientSecret, accessToken, true, realmId, config_1.default.quickbooksEnvironment == 'sandbox' ? true : false, true, null, '2.0', refreshToken);
                    qbo.createAccount(data, function (err, response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(response);
                            }
                        });
                    });
                });
                return account;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new QuickbooksClient();
