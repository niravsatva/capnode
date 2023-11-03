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
    getEmployeesByLastSync(accessToken, realmId, refreshToken, lastSyncDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
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
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get time activities by last sync date
    getTimeActivitiesByLastSync(accessToken, realmId, refreshToken, lastSyncDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
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
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get closing date
    getClosingDate(accessToken, realmId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new Promise((resolve, reject) => {
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
}
exports.default = new QuickbooksClient();
