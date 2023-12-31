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
const developerServices_1 = __importDefault(require("../services/developerServices"));
const customError_1 = require("../models/customError");
class DeveloperController {
    deleteCompany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, secret } = req.body;
                if (secret != 'gK8E22}RUyP[4((p7v43(Yn.KgrgLG') {
                    throw new customError_1.CustomError(401, 'Unauthorized');
                }
                yield developerServices_1.default.deleteCompanyFromDb(companyId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'company deleted successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new DeveloperController();
