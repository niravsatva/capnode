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
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
const quickbooksClient_1 = __importDefault(require("../quickbooksClient/quickbooksClient"));
const costAllocationRepository_1 = __importDefault(require("../repositories/costAllocationRepository"));
const utils_1 = require("../utils/utils");
const quickbooksServices_1 = __importDefault(require("./quickbooksServices"));
class JournalService {
    getJournalEntriesByPayPeriod(query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(query.companyId);
            let qbAccounts = [];
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
                qbAccounts = (0, utils_1.sortArray)(finalAccounts, 'asc', 'Name');
            }
            const timeSheetData = yield prisma_1.prisma.timeSheets.findFirst({
                where: {
                    payPeriodId: query === null || query === void 0 ? void 0 : query.payPeriodId,
                    companyId: query === null || query === void 0 ? void 0 : query.companyId
                },
            });
            if (!timeSheetData) {
                throw new customError_1.CustomError(400, 'Can not Preview Journal');
            }
            const queryCostAllocation = Object.assign(Object.assign({}, query), { timeSheetId: timeSheetData.id });
            const companyConfiguration = yield prisma_1.prisma.configuration.findFirst({
                where: {
                    companyId: query.companyId
                }
            });
            const fieldSettings = companyConfiguration === null || companyConfiguration === void 0 ? void 0 : companyConfiguration.settings;
            const configurationSectionData = yield prisma_1.prisma.configurationSection.findMany({
                where: {
                    companyId: query.companyId,
                    no: {
                        gt: 0
                    }
                },
                select: {
                    id: true,
                    no: true,
                    fields: {
                        where: {
                            jsonId: {
                                not: 't1'
                            }
                        },
                        orderBy: {
                            jsonId: 'asc'
                        }
                    }
                },
            });
            const fieldMapping = {};
            configurationSectionData.forEach((section) => {
                section.fields.forEach((field) => {
                    var _a;
                    const configFieldValue = (_a = fieldSettings[section.no.toString()]) === null || _a === void 0 ? void 0 : _a.fields[field.jsonId];
                    if (configFieldValue) {
                        const findAccount = qbAccounts.find((account) => account.Id == configFieldValue.value);
                        if (findAccount) {
                            fieldMapping[field.id] = {
                                id: field.id,
                                label: findAccount.Name,
                                value: findAccount.Id
                            };
                        }
                    }
                });
            });
            const fieldIds = Object.keys(fieldMapping);
            const costAllocationData = yield costAllocationRepository_1.default.getCostAllocationForJournal(queryCostAllocation);
            const journalEntries = [];
            costAllocationData.forEach((singleAllocation) => {
                fieldIds.forEach((field) => {
                    const costAllocation = singleAllocation.costAllocation;
                    costAllocation.forEach((employee) => {
                        if (fieldMapping[field]) {
                            const singleJournalEntry = {
                                employeeName: employee['employee-name'],
                                account: fieldMapping[field].label,
                                class: employee['class-name'],
                                customer: employee['customer-name'],
                                debit: employee[field]
                            };
                            journalEntries.push(singleJournalEntry);
                        }
                    });
                });
                // singleAllocation.costAllocation.forEach((employee: any) => {
                //     const employeeKeys = Object.keys(employee);
                //     employeeKeys.forEach((key) => {
                //         if (fieldMapping[key]) {
                //             const singleJournalEntry = {
                //                 employeeName: employee['employee-name'],
                //                 account: fieldMapping[key].label,
                //                 class: employee['class-name'],
                //                 customer: employee['customer-name'],
                //                 debit: employee[key]
                //             }
                //             journalEntries.push(singleJournalEntry);
                //         }
                //     })
                // });
            });
            return { journalEntries, fieldMapping };
        });
    }
}
exports.default = new JournalService();
