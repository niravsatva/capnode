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
const customError_1 = require("../models/customError");
const quickbooksAuthClient_1 = __importDefault(require("../quickbooksClient/quickbooksAuthClient"));
const repositories_1 = require("../repositories");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class QuickbooksService {
    getAccessToken(companyId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const accessTokenUTCDate = (0, moment_timezone_1.default)(companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.accessTokenUTCDate);
                const currentDateTime = (0, moment_timezone_1.default)(new Date());
                const minutes = currentDateTime.diff(accessTokenUTCDate, 'minutes');
                if (minutes >= 45) {
                    console.log('Inside 45');
                    const utc = moment_timezone_1.default.utc().valueOf();
                    const authResponse = yield quickbooksAuthClient_1.default.refreshToken(companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.refreshToken);
                    if (authResponse != null) {
                        const updatedCompany = yield repositories_1.companyRepository.updateCompany(companyId, {
                            accessToken: (_a = authResponse === null || authResponse === void 0 ? void 0 : authResponse.token) === null || _a === void 0 ? void 0 : _a.access_token,
                            refreshToken: (_b = authResponse === null || authResponse === void 0 ? void 0 : authResponse.token) === null || _b === void 0 ? void 0 : _b.refresh_token,
                            accessTokenUTCDate: moment_timezone_1.default.utc(utc).toDate(),
                        });
                        return updatedCompany;
                    }
                }
                else {
                    return companyDetails;
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new QuickbooksService();
