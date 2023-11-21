"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../client/prisma");
const journalInterface_1 = require("../interfaces/journalInterface");
const customError_1 = require("../models/customError");
const quickbooksClient_1 = __importDefault(require("../quickbooksClient/quickbooksClient"));
const repositories_1 = require("../repositories");
const costAllocationRepository_1 = __importDefault(require("../repositories/costAllocationRepository"));
const utils_1 = require("../utils/utils");
const quickbooksServices_1 = __importDefault(require("./quickbooksServices"));
const uuid_1 = require("uuid");
const costallocationServices_1 = __importDefault(require("./costallocationServices"));
const costAllocationPdf_1 = require("../templates/costAllocationPdf");
const fs = __importStar(require("fs"));
const enum_1 = require("../enum");
class JournalService {
    getJournalEntriesByPayPeriod(query, quickBooksDecimal) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const qbAccounts = yield this.getAccount(query.companyId);
            const qbClasses = yield this.getAllClasses(query.companyId);
            const qbCustomers = yield this.getAllCustomer(query.companyId);
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
            let defaultAmountToFixed = 2;
            const companyConfiguration = yield prisma_1.prisma.configuration.findFirst({
                where: {
                    companyId: query.companyId
                }
            });
            if (companyConfiguration === null || companyConfiguration === void 0 ? void 0 : companyConfiguration.decimalToFixedAmount) {
                defaultAmountToFixed = companyConfiguration.decimalToFixedAmount;
            }
            if (quickBooksDecimal) {
                defaultAmountToFixed = 2;
            }
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
                            },
                            isActive: true
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
            const indirectAllocationFieldValue = (_a = fieldSettings['4']) === null || _a === void 0 ? void 0 : _a.fields['f1'];
            const findIndirectAllocationAccount = qbAccounts.find((account) => account.Id == indirectAllocationFieldValue.value);
            if (findIndirectAllocationAccount) {
                fieldMapping['indirect-allocation'] = {
                    id: 'indirect-allocation',
                    label: findIndirectAllocationAccount.Name,
                    value: findIndirectAllocationAccount.Id
                };
            }
            const salaryExpenseCreditValue = (_b = fieldSettings['0']) === null || _b === void 0 ? void 0 : _b.fields['f1'];
            const salaryExpenseCreditClass = qbClasses.find((qbClass) => qbClass.Id == salaryExpenseCreditValue.value);
            const indirectAllocationCreditValue = (_c = fieldSettings['0']) === null || _c === void 0 ? void 0 : _c.fields['f2'];
            const indirectAllocationCreditValueClass = qbClasses.find((qbClass) => qbClass.Id == indirectAllocationCreditValue.value);
            const creditCustomerValue = (_d = fieldSettings['5']) === null || _d === void 0 ? void 0 : _d.fields['f1'];
            const creditCustomerName = qbCustomers.find((qbCustomer) => qbCustomer.Id === creditCustomerValue.value);
            const fieldIds = Object.keys(fieldMapping);
            const costAllocationData = yield costAllocationRepository_1.default.getCostAllocationForJournal(queryCostAllocation);
            const journalEntries = [];
            let finalDebitTotal = 0;
            let finalCreditTotal = 0;
            costAllocationData.forEach((singleAllocation) => {
                fieldIds.forEach((field) => {
                    const costAllocation = singleAllocation.costAllocation;
                    let total = 0;
                    let totalNegative = 0;
                    costAllocation.forEach((employee) => {
                        if (fieldMapping[field]) {
                            let isNegative = false;
                            if (employee[field] < 0) {
                                isNegative = true;
                            }
                            const singleJournalEntry = {
                                key: (0, uuid_1.v4)(),
                                employeeName: employee['employee-name'],
                                account: fieldMapping[field].label,
                                class: employee['class-name'],
                                classId: employee['classId'],
                                customer: employee['customer-name'],
                                customerId: employee['customerId'],
                                debit: !isNegative ? employee[field].toFixed(defaultAmountToFixed) : '',
                                credit: isNegative ? Math.abs(employee[field].toFixed(defaultAmountToFixed)) : '',
                                accountId: fieldMapping[field].value,
                                type: isNegative ? 'Credit' : 'Debit'
                            };
                            if (isNegative) {
                                totalNegative = Number((Number(totalNegative.toFixed(defaultAmountToFixed)) +
                                    Math.abs(Number(employee[field].toFixed(defaultAmountToFixed)))).toFixed(defaultAmountToFixed));
                            }
                            if (!isNegative) {
                                total = Number((Number(total.toFixed(defaultAmountToFixed)) + Number(employee[field].toFixed(defaultAmountToFixed))).toFixed(defaultAmountToFixed));
                                finalDebitTotal = Number((Number(finalDebitTotal.toFixed(defaultAmountToFixed)) + Number(employee[field].toFixed(defaultAmountToFixed))).toFixed(defaultAmountToFixed));
                            }
                            journalEntries.push(singleJournalEntry);
                        }
                    });
                    const singleJournalEntry = {
                        key: (0, uuid_1.v4)(),
                        employeeName: '',
                        account: fieldMapping[field].label,
                        class: field === 'indirect-allocation' ? indirectAllocationCreditValueClass.FullyQualifiedName : salaryExpenseCreditClass.FullyQualifiedName,
                        classId: field === 'indirect-allocation' ? indirectAllocationCreditValueClass.Id : salaryExpenseCreditClass.Id,
                        customer: creditCustomerName.DisplayName,
                        customerId: creditCustomerName.Id,
                        debit: totalNegative ? totalNegative.toFixed(defaultAmountToFixed) : '',
                        credit: total ? total.toFixed(defaultAmountToFixed) : '',
                        accountId: fieldMapping[field].value,
                        type: totalNegative ? 'Debit' : 'Credit'
                    };
                    finalCreditTotal = Number((Number(finalCreditTotal.toFixed(defaultAmountToFixed)) + Number(total.toFixed(defaultAmountToFixed))).toFixed(defaultAmountToFixed));
                    if (totalNegative) {
                        finalCreditTotal = Number((Number(finalCreditTotal.toFixed(defaultAmountToFixed)) + Number(totalNegative.toFixed(defaultAmountToFixed))).toFixed(defaultAmountToFixed));
                        finalDebitTotal = Number((Number(finalDebitTotal.toFixed(defaultAmountToFixed)) + Number(totalNegative.toFixed(defaultAmountToFixed))).toFixed(defaultAmountToFixed));
                    }
                    journalEntries.push(singleJournalEntry);
                });
            });
            journalEntries.forEach((e, index) => {
                e['id'] = index + 1;
            });
            journalEntries.push({
                id: '',
                key: (0, uuid_1.v4)(),
                employeeName: '',
                account: 'Total',
                class: '',
                customer: '',
                debit: finalDebitTotal.toFixed(defaultAmountToFixed),
                credit: finalCreditTotal.toFixed(defaultAmountToFixed),
                accountId: ''
            });
            return journalEntries;
        });
    }
    getAccount(companyId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
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
            return qbAccounts;
        });
    }
    getAllClasses(companyId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            let qbClasses = [];
            if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                // Get All Classes From Quickbooks
                const classes = yield quickbooksClient_1.default.getAllClasses(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                const finalClasses = (_b = (_a = classes === null || classes === void 0 ? void 0 : classes.QueryResponse) === null || _a === void 0 ? void 0 : _a.Class) === null || _b === void 0 ? void 0 : _b.filter((item) => (item === null || item === void 0 ? void 0 : item.SubClass) === true);
                qbClasses = finalClasses;
            }
            return qbClasses;
        });
    }
    getAllCustomer(companyId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            let qbCustomers = [];
            if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                // Get All Customers from Quickbooks
                const customers = yield quickbooksClient_1.default.getAllCustomers(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken);
                qbCustomers = (_a = customers === null || customers === void 0 ? void 0 : customers.QueryResponse) === null || _a === void 0 ? void 0 : _a.Customer;
            }
            return qbCustomers;
        });
    }
    getAllJournals(timeSheetData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, payPeriodId, page, limit, search, status, type, sort, year } = timeSheetData;
            if (!companyId) {
                throw new customError_1.CustomError(400, 'Company id is required');
            }
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            // Offset set
            const offset = (Number(page) - 1) * Number(limit);
            // Filter Conditions
            let filterConditions = {};
            if (status) {
                filterConditions = {
                    status: Number(status),
                };
            }
            let payPeriodFilter = {};
            if ((0, utils_1.hasText)(payPeriodId)) {
                payPeriodFilter = {
                    payPeriodId: payPeriodId,
                };
            }
            // Conditions for searching
            const searchCondition = search
                ? {
                    OR: [
                        {
                            notes: { contains: search, mode: 'insensitive' },
                        },
                    ],
                }
                : {};
            const orderByArray = [];
            if (sort === 'createdByName') {
                orderByArray.push({
                    createdBy: {
                        firstName: type ? type : 'desc',
                    },
                });
            }
            if (sort === 'status') {
                orderByArray.push({
                    status: type ? type : 'desc',
                });
            }
            if (sort == 'date') {
                orderByArray.push({
                    date: type ? type : 'desc',
                });
            }
            if (sort == 'amount') {
                orderByArray.push({
                    amount: type ? type : 'desc',
                });
            }
            if (sort == 'qboJournalNo') {
                orderByArray.push({
                    qboJournalNo: type ? type : 'desc',
                });
            }
            orderByArray.push({
                id: 'desc',
            });
            const sortCondition = {
                orderBy: orderByArray,
            };
            const data = {
                companyId,
                offset: offset,
                limit: limit,
                filterConditions: filterConditions,
                searchCondition: searchCondition,
                sortCondition: sortCondition,
                payPeriodFilter: payPeriodFilter,
                year: year
            };
            const { journals, count } = yield repositories_1.journalRepository.getAllJournals(data);
            return { journals, count };
        });
    }
    getJournalByPayPeriodId(payPeriodId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.journal.findFirst({
                where: {
                    companyId,
                    payPeriodId
                }
            });
        });
    }
    createJournal(data) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const validatePayPeriod = yield prisma_1.prisma.payPeriod.findFirst({
                where: {
                    id: data.payPeriodId,
                    companyId: data.companyId
                }
            });
            if (!validatePayPeriod) {
                throw new customError_1.CustomError(400, 'Invalid pay period');
            }
            let amount = '0';
            const findExistingJournal = yield prisma_1.prisma.journal.findFirst({
                where: {
                    companyId: data.companyId,
                    payPeriodId: data.payPeriodId
                }
            });
            let journalData;
            if (findExistingJournal) {
                journalData = yield prisma_1.prisma.journal.update({
                    where: {
                        payPeriodId: findExistingJournal.payPeriodId
                    },
                    data
                });
            }
            else {
                journalData = yield prisma_1.prisma.journal.create({
                    data: Object.assign(Object.assign({}, data), { amount })
                });
            }
            const journalEntries = yield this.getJournalEntriesByPayPeriod({
                companyId: data.companyId,
                payPeriodId: journalData.payPeriodId
            }, true);
            if (journalEntries && journalEntries.length) {
                if (journalEntries[journalEntries.length - 1]) {
                    if (journalEntries[journalEntries.length - 1].debit) {
                        amount = journalEntries[journalEntries.length - 1].debit;
                    }
                }
            }
            yield prisma_1.prisma.journal.update({
                where: {
                    id: journalData.id
                },
                data: {
                    amount
                }
            });
            if (journalData.status === journalInterface_1.EJournalStatus.PUBLISHED) {
                try {
                    const start = Date.now();
                    const response = yield this.publishJournalToQBO(journalData, journalEntries);
                    const duration = Date.now() - start;
                    if (response) {
                        yield prisma_1.prisma.journal.update({
                            where: {
                                id: journalData.id
                            },
                            data: {
                                qboJournalTrnId: response
                            }
                        });
                        yield prisma_1.prisma.timeSheets.update({
                            where: {
                                payPeriodId: journalData.payPeriodId,
                            },
                            data: {
                                status: 'Published'
                            }
                        });
                        yield prisma_1.prisma.payPeriod.update({
                            where: {
                                id: journalData.payPeriodId
                            },
                            data: {
                                isJournalPublished: true
                            }
                        });
                        yield prisma_1.prisma.syncLogs.create({
                            data: {
                                moduleName: enum_1.QBOModules.JOURNAL,
                                status: enum_1.SyncLogsStatus.SUCCESS,
                                message: `Journal with Journal No: ${journalData.qboJournalNo} and Amount: $${journalData.amount} has been posted successfully in 
                            ${Number(duration) / 1000} seconds.`,
                                companyId: journalData.companyId,
                            },
                        });
                    }
                }
                catch (error) {
                    yield prisma_1.prisma.journal.update({
                        where: {
                            id: journalData.id
                        },
                        data: {
                            status: journalInterface_1.EJournalStatus.DRAFT
                        }
                    });
                    yield prisma_1.prisma.timeSheets.update({
                        where: {
                            payPeriodId: journalData.payPeriodId,
                        },
                        data: {
                            status: 'Draft'
                        }
                    });
                    yield prisma_1.prisma.payPeriod.update({
                        where: {
                            id: journalData.payPeriodId
                        },
                        data: {
                            isJournalPublished: false
                        }
                    });
                    let customErrorMessage = 'Error while posting journal in Quickbooks';
                    if (error && (error === null || error === void 0 ? void 0 : error.Fault) && ((_a = error.Fault) === null || _a === void 0 ? void 0 : _a.Error) && error.Fault.Error.length) {
                        customErrorMessage = `${(_c = (_b = error === null || error === void 0 ? void 0 : error.Fault) === null || _b === void 0 ? void 0 : _b.Error[0]) === null || _c === void 0 ? void 0 : _c.Message}: ${(_e = (_d = error === null || error === void 0 ? void 0 : error.Fault) === null || _d === void 0 ? void 0 : _d.Error[0]) === null || _e === void 0 ? void 0 : _e.Detail}`;
                    }
                    yield prisma_1.prisma.syncLogs.create({
                        data: {
                            moduleName: enum_1.QBOModules.JOURNAL,
                            status: enum_1.SyncLogsStatus.FAILURE,
                            message: customErrorMessage,
                            companyId: journalData.companyId,
                        },
                    });
                    throw new customError_1.CustomError(400, customErrorMessage);
                }
            }
            return journalData;
        });
    }
    publishJournalToQBO(journalData, journalEntries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!journalEntries || !journalEntries.length) {
                throw new customError_1.CustomError(400, 'Cannot post empty journal entries');
            }
            const journalDataQBO = {
                Line: this.createQBOJournalLineItems(journalEntries),
                'PrivateNote': (journalData === null || journalData === void 0 ? void 0 : journalData.notes) || '',
                'TxnDate': (0, moment_1.default)(journalData === null || journalData === void 0 ? void 0 : journalData.date).format('YYYY-MM-DD'),
                'DocNumber': journalData.qboJournalNo
            };
            if (journalData === null || journalData === void 0 ? void 0 : journalData.qboJournalTrnId) {
                journalDataQBO['Id'] = journalData === null || journalData === void 0 ? void 0 : journalData.qboJournalTrnId;
                const oldJournalData = yield this.getJournalFromQBO(journalData === null || journalData === void 0 ? void 0 : journalData.companyId, journalData === null || journalData === void 0 ? void 0 : journalData.qboJournalTrnId);
                if (oldJournalData) {
                    journalDataQBO['SyncToken'] = oldJournalData === null || oldJournalData === void 0 ? void 0 : oldJournalData.SyncToken;
                }
            }
            const requestToSaveJournal = yield this.saveJournalToQBO(journalData.companyId, journalDataQBO);
            if (requestToSaveJournal && (requestToSaveJournal === null || requestToSaveJournal === void 0 ? void 0 : requestToSaveJournal.Id)) {
                const { finalDataArr, counts, filePath, companyName } = yield costallocationServices_1.default.exportCostAllocationPDF({
                    companyId: journalData.companyId,
                    payPeriodId: journalData.payPeriodId
                });
                const stream = yield (0, costAllocationPdf_1.generatePdf)(finalDataArr, counts, filePath, journalData === null || journalData === void 0 ? void 0 : journalData.payPeriodId, companyName);
                const fileName = (0, moment_1.default)(new Date()).format('MMDDYYYYhhmmss');
                stream.on('close', () => __awaiter(this, void 0, void 0, function* () {
                    yield this.updateAttachmentForJournal(journalData === null || journalData === void 0 ? void 0 : journalData.companyId, requestToSaveJournal === null || requestToSaveJournal === void 0 ? void 0 : requestToSaveJournal.Id, `CostAllocation_${fileName}.pdf`, fs.createReadStream(filePath));
                    fs.unlinkSync(filePath);
                }));
            }
            return requestToSaveJournal === null || requestToSaveJournal === void 0 ? void 0 : requestToSaveJournal.Id;
        });
    }
    saveJournalToQBO(companyId, journalData) {
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            let response = {};
            if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                // Get All Accounts From Quickbooks
                if (journalData === null || journalData === void 0 ? void 0 : journalData.Id) {
                    response = yield quickbooksClient_1.default.updateJournalEntry(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, journalData);
                }
                else {
                    response = yield quickbooksClient_1.default.createJournalEntry(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, journalData);
                }
            }
            return response;
        });
    }
    updateAttachmentForJournal(companyId, entityId, fileName, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                yield quickbooksClient_1.default.uploadFile(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, fileName, 'application/pdf', content, 'JournalEntry', entityId);
            }
        });
    }
    createQBOJournalLineItems(journalEntries) {
        const QBOJournalLineItems = [];
        journalEntries.forEach((entry, index) => {
            if (journalEntries.length - 1 != index) {
                QBOJournalLineItems.push({
                    'JournalEntryLineDetail': {
                        'PostingType': entry.type,
                        'AccountRef': {
                            'name': entry.account,
                            'value': entry.accountId
                        },
                        'Entity': {
                            'EntityRef': {
                                'name': entry.customer,
                                'value': entry.customerId
                            },
                            'Type': 'Customer'
                        },
                        'ClassRef': {
                            'name': entry.class,
                            'value': entry.classId
                        }
                    },
                    'DetailType': 'JournalEntryLineDetail',
                    'Amount': Number(entry.type === 'Debit' ? entry.debit : entry.credit),
                    'Id': index,
                    'Description': entry.employeeName,
                    'LineNum': index + 1
                });
            }
        });
        return QBOJournalLineItems;
    }
    getJournalFromQBO(companyId, journalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield quickbooksServices_1.default.getAccessToken(companyId);
            let response = {};
            if ((authResponse === null || authResponse === void 0 ? void 0 : authResponse.status) == true) {
                // Get All Accounts From Quickbooks
                response = yield quickbooksClient_1.default.getJournal(authResponse === null || authResponse === void 0 ? void 0 : authResponse.accessToken, authResponse === null || authResponse === void 0 ? void 0 : authResponse.tenantID, authResponse === null || authResponse === void 0 ? void 0 : authResponse.refreshToken, journalId);
            }
            return response;
        });
    }
}
exports.default = new JournalService();
