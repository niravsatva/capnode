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
const companyRepository_1 = __importDefault(require("../repositories/companyRepository"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
class CompanyController {
    getUserWiseCompanies(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.session.user;
                const companies = yield companyRepository_1.default.getUserCompanies(user);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Companies fetched successfully', companies);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getAllCompanies(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companies = yield companyRepository_1.default.getAll();
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Companies fetched successfully', companies);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getCompanyDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const company = yield (companyRepository_1.default === null || companyRepository_1.default === void 0 ? void 0 : companyRepository_1.default.getDetails(id));
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Company details fetched successfully', company);
            }
            catch (err) {
                next(err);
            }
        });
    }
    createCompany(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { tenantName, tenantId } = req.body;
            const data = {
                tenantID: tenantId,
                tenantName: tenantName,
            };
            const company = yield companyRepository_1.default.create(data);
            const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            yield (companyRepository_1.default === null || companyRepository_1.default === void 0 ? void 0 : companyRepository_1.default.connectCompany(user, company === null || company === void 0 ? void 0 : company.id));
            return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'Company created successfully', company);
        });
    }
}
exports.default = new CompanyController();
