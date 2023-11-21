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
const journalServices_1 = __importDefault(require("../services/journalServices"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const customError_1 = require("../models/customError");
class JournalController {
    getJournalEntries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield journalServices_1.default.getJournalEntriesByPayPeriod(req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getJournalFromQBO(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield journalServices_1.default.getJournalFromQBO(req.query.companyId, req.query.journalId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllJournals(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, page = 1, limit = 10, search = '', status = '', type = '', sort = '', payPeriodId = '', year, } = req.query;
                const data = {
                    companyId: companyId,
                    payPeriodId: payPeriodId,
                    page: Number(page),
                    limit: Number(limit),
                    search: search,
                    status: Number(status),
                    type: type,
                    sort: sort,
                    year: year,
                };
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Journals Entries',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const timeSheets = yield journalServices_1.default.getAllJournals(data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Journals fetched successfully', timeSheets);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getJournalByPayPeriod(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield journalServices_1.default.getJournalByPayPeriodId(req.query.payPeriodId, req.query.companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createJournal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const body = req.body;
                req.body.createdById = req.user.id;
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, req.body.companyId, {
                    permissionName: 'Journals Entries',
                    permission: ['add'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const data = yield journalServices_1.default.createJournal(body);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new JournalController();
