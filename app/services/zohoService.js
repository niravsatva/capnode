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
/* eslint-disable camelcase */
const axios_1 = __importDefault(require("axios"));
const url_1 = __importDefault(require("url"));
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
class ZohoService {
    generateToken(zohoUrl) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const urlTest = url_1.default.parse(zohoUrl, true);
            const axiosRes = yield (0, axios_1.default)({
                url: 'https://accounts.zoho.com/oauth/v2/token',
                method: 'POST',
                params: {
                    response_type: 'code',
                    client_id: process.env.ZOHO_CLIENT_ID,
                    grant_type: 'authorization_code',
                    client_secret: process.env.ZOHO_CLIENT_SECRET,
                    redirect_uri: process.env.ZOHO_REDIRECT_URL,
                    code: (_a = urlTest.query) === null || _a === void 0 ? void 0 : _a.code
                }
            });
            yield prisma_1.prisma.zohoDetails.deleteMany();
            const create = yield prisma_1.prisma.zohoDetails.create({
                data: {
                    accessToken: axiosRes.data.access_token,
                    refreshToken: axiosRes.data.refresh_token || '',
                    scope: axiosRes.data.scope,
                    apiDomain: axiosRes.data.api_domain
                }
            });
            return create;
        });
    }
    createHostedPage(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionData = yield prisma_1.prisma.subscription.findFirst({
                where: {
                    companyId
                }
            });
            if (!subscriptionData) {
                throw new customError_1.CustomError(400, 'No previous subscription found');
            }
            yield this.refreshToken();
            const findTokenDetails = yield prisma_1.prisma.zohoDetails.findFirst();
            if (!findTokenDetails) {
                throw new customError_1.CustomError(400, 'Token details not found');
            }
            const createHostedPayMentPage = yield (0, axios_1.default)({
                url: 'https://www.zohoapis.com/subscriptions/v1/hostedpages/newsubscription',
                method: 'post',
                headers: {
                    'Authorization': `Zoho-oauthtoken ${findTokenDetails.accessToken}`,
                    'X-com-zoho-subscriptions-organizationid': `${process.env.ZOHO_ORGANIZATION_ID}`,
                },
                data: {
                    'customer_id': subscriptionData === null || subscriptionData === void 0 ? void 0 : subscriptionData.zohoCustomerId,
                    'plan': {
                        'plan_code': process.env.ZOHO_PLAN_CODE
                    }
                }
            });
            return createHostedPayMentPage.data.hostedpage.url;
        });
    }
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const findTokenDetails = yield prisma_1.prisma.zohoDetails.findFirst();
            if (!findTokenDetails) {
                throw new customError_1.CustomError(400, 'Token details not found');
            }
            const res = yield (0, axios_1.default)({
                url: 'https://accounts.zoho.com/oauth/v2/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    'refresh_token': findTokenDetails.refreshToken,
                    'client_id': process.env.ZOHO_CLIENT_ID,
                    'client_secret': process.env.ZOHO_CLIENT_SECRET,
                    'redirect_uri': 'http://www.zoho.com/subscriptions',
                    'grant_type': 'refresh_token'
                }
            });
            yield prisma_1.prisma.zohoDetails.update({
                where: {
                    id: findTokenDetails.id
                },
                data: {
                    accessToken: res.data.access_token
                }
            });
        });
    }
}
exports.default = new ZohoService();
