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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
const configurationServices_1 = __importDefault(require("../services/configurationServices"));
class ConfigurationController {
    getCompanyConfiguration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.query.companyId;
                const payPeriodId = req.query.payPeriodId;
                if (!payPeriodId) {
                    throw new customError_1.CustomError(400, 'PayPeriod Required');
                }
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const configurationDetails = yield configurationRepository_1.default.getCompanyConfiguration(companyId, payPeriodId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', configurationDetails);
            }
            catch (err) {
                next(err);
            }
        });
    }
    updateCompanyConfiguration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                const payPeriodId = req.body.payPeriodId;
                const { settings, indirectExpenseRate, payrollMethod, decimalToFixedAmount, decimalToFixedPercentage } = req.body;
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const data = {
                    settings: settings,
                    indirectExpenseRate: indirectExpenseRate,
                    payrollMethod: payrollMethod,
                    decimalToFixedAmount,
                    decimalToFixedPercentage,
                    payPeriodId
                };
                // Update configuration
                const updatedConfiguration = yield configurationRepository_1.default.updateConfiguration(companyId, payPeriodId, data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations updated successfully', updatedConfiguration);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getFieldsSection(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, payPeriodId } = req.query;
                const sections = yield configurationServices_1.default.getFieldsSection(companyId, payPeriodId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Section fields fetched successfully', sections);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.body, { companyId, sectionId, payPeriodId } = _a, data = __rest(_a, ["companyId", "sectionId", "payPeriodId"]);
                (0, validationHelper_1.checkValidation)(req);
                const createdField = yield configurationServices_1.default.createField(companyId, sectionId, payPeriodId, data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Field created successfully', createdField);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fieldId, companyId, payPeriodId } = req.body;
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                (0, validationHelper_1.checkValidation)(req);
                const deletedField = yield configurationServices_1.default.deleteField(fieldId, companyId, payPeriodId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Field deleted successfully', deletedField);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateField(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fieldId, fieldName } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const editedField = yield configurationServices_1.default.updateField(fieldId, fieldName);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Field updated successfully', editedField);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new ConfigurationController();
