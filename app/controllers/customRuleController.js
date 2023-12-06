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
const customRuleService_1 = __importDefault(require("../services/customRuleService"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const customError_1 = require("../models/customError");
const validationHelper_1 = require("../helpers/validationHelper");
class CustomRuleController {
    getListOfCustomRules(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield customRuleService_1.default.getCustomRuleList(req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Rules fetched successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getCustomRuleById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    throw new customError_1.CustomError(400, 'Id is required');
                }
                const companyId = req.query.companyId;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'CompanyId is required');
                }
                const data = yield customRuleService_1.default.getCustomRuleById(id, companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Rules fetched successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createCustomRules(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                console.log(req.user);
                const data = yield customRuleService_1.default.saveCustomRule(req.body, req.user.id, null);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Rule created successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateCustomRules(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    throw new customError_1.CustomError(400, 'Id is required');
                }
                const data = yield customRuleService_1.default.saveCustomRule(req.body, req.user.id, id);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Rules updated successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteCustomRuleById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    throw new customError_1.CustomError(400, 'Id is required');
                }
                const companyId = req.query.companyId;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'CompanyId is required');
                }
                const data = yield customRuleService_1.default.deleteCustomRuleById(id, companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Deleted rule successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updatePriority(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyId = req.query.companyId;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'CompanyId is required');
                }
                const data = yield customRuleService_1.default.updatePriority(req.body, companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Updated rule priority successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CustomRuleController();
