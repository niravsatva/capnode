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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const axios_1 = __importDefault(require("axios"));
/* eslint-disable @typescript-eslint/no-var-requires */
const OAuthClient = require('intuit-oauth');
const authClient = new OAuthClient({
    clientId: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.quickbooksClientId,
    clientSecret: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.quickbooksClientSecret,
    environment: ((_a = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.quickbooksEnvironment) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'sandbox'
        ? 'sandbox'
        : 'production',
    redirectUri: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.quickbooksRedirectUri,
});
class QuickbooksAuthClient {
    authorizeUri(stateValue) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let authUri = '';
                authUri = authClient.authorizeUri({
                    scope: (_a = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.quickbooksScopes) === null || _a === void 0 ? void 0 : _a.split(','),
                    state: stateValue,
                });
                return authUri;
            }
            catch (err) {
                throw err;
            }
        });
    }
    createAuthToken(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authToken = yield authClient.createToken(url);
                return authToken.token;
            }
            catch (err) {
                throw err;
            }
        });
    }
    revokeToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientAuthorization = Buffer.from(config_1.default.quickbooksClientId + ':' + config_1.default.quickbooksClientSecret, 'utf-8').toString('base64');
                yield axios_1.default
                    .post(config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.quickbooksTokenRevokeEndpoint, {
                    token: refreshToken,
                }, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Basic ${clientAuthorization}`,
                        'Content-Type': 'application/json',
                    },
                })
                    .catch((err) => {
                    throw err;
                });
            }
            catch (err) {
                throw err;
            }
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authResponse = yield authClient.refreshUsingToken(refreshToken);
                return authResponse;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new QuickbooksAuthClient();
