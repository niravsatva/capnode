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
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
class ConfigurationController {
    getCompanyConfiguration(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check validation for company
                (0, validationHelper_1.checkValidation)(req);
                const companyId = req.body.companyId;
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const configurationDetails = yield configurationRepository_1.default.getCompanyConfiguration(companyId);
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
                const { settings, indirectExpenseRate, payrollMethod } = req.body;
                // Check If company exists
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const data = {
                    settings: settings,
                    indirectExpenseRate: indirectExpenseRate,
                    payrollMethod: payrollMethod,
                };
                // Update configuration
                const updatedConfiguration = yield configurationRepository_1.default.updateConfiguration(companyId, data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations updated successfully', updatedConfiguration);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new ConfigurationController();
