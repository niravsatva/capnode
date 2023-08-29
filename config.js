"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
// Env file configuration
function config(Env) {
    return {
        port: Env === null || Env === void 0 ? void 0 : Env.PORT,
        reactAppBaseUrl: Env === null || Env === void 0 ? void 0 : Env.REACT_APP_BASE_URL,
        databaseHost: Env === null || Env === void 0 ? void 0 : Env.DATABASE_HOST,
        databaseUser: Env === null || Env === void 0 ? void 0 : Env.DATABASE_USER,
        databasePassword: Env === null || Env === void 0 ? void 0 : Env.DATABASE_PASSWORD,
        databaseName: Env === null || Env === void 0 ? void 0 : Env.DATABASE_NAME,
        databasePort: Env === null || Env === void 0 ? void 0 : Env.DATABASE_PORT,
        databaseUrl: Env === null || Env === void 0 ? void 0 : Env.DATABASE_URL,
        accessTokenSecretKey: Env === null || Env === void 0 ? void 0 : Env.ACCESS_TOKEN_SECRET_KEY,
        refreshTokenSecretKey: Env === null || Env === void 0 ? void 0 : Env.REFRESH_TOKEN_SECRET_KEY,
        forgotPasswordTokenSecretKey: Env === null || Env === void 0 ? void 0 : Env.FORGOT_PASSWORD_TOKEN_SECRET_KEY,
        sessionSecretKey: Env === null || Env === void 0 ? void 0 : Env.SESSION_SECRET_KEY,
        smtpEmail: Env === null || Env === void 0 ? void 0 : Env.SMTP_EMAIL,
        smtpEmailLogin: Env === null || Env === void 0 ? void 0 : Env.SMTP_EMAIL_LOGIN,
        smtpPassword: Env === null || Env === void 0 ? void 0 : Env.SMTP_PASSWORD,
        smtpHost: Env === null || Env === void 0 ? void 0 : Env.SMTP_HOST,
        smtpPort: Env === null || Env === void 0 ? void 0 : Env.SMTP_PORT,
        forgotPasswordUrlExpireTime: 30 * 60 * 1000,
        registerUrlExpireTime: 7 * 24 * 60 * 60 * 1000,
        accessTokenExpireTime: 24 * 60 * 60,
        refreshTokenExpireTime: 10 * 24 * 60 * 60,
        resetPasswordReactUrl: `${Env === null || Env === void 0 ? void 0 : Env.REACT_APP_BASE_URL}/reset-password`,
        changePasswordReactUrl: `${Env === null || Env === void 0 ? void 0 : Env.REACT_APP_BASE_URL}/reset-password`,
        s3accessKeyId: Env === null || Env === void 0 ? void 0 : Env.S3_ACCESSKEYID,
        s3secretAccessKey: Env === null || Env === void 0 ? void 0 : Env.S3_SECRETACCESSKEY,
        s3BaseUrl: Env === null || Env === void 0 ? void 0 : Env.S3_BASE_URL,
        quickbooksClientId: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_CLIENT_ID,
        quickbooksClientSecret: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_CLIENT_SECRET,
        quickbooksEnvironment: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_ENVIRONMENT,
        quickbooksRedirectUri: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_REDIRECT_URI,
        quickbooksScopes: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_SCOPES,
        quickbooksUserInfoEndpoint: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_USER_INFO_ENDPOINT,
        quickbooksTokenRevokeEndpoint: Env === null || Env === void 0 ? void 0 : Env.QUICKBOOKS_TOKEN_REVOKE_ENDPOINT,
        employeeSyncLambdaEndpoint: Env === null || Env === void 0 ? void 0 : Env.EMPLOYEE_SYNC_LAMBDA_ENDPOINT,
        employeeSyncLambdaApiKey: Env === null || Env === void 0 ? void 0 : Env.EMPLOYEE_SYNC_API_KEY,
        timeactivitySyncLambdaEndpoint: Env === null || Env === void 0 ? void 0 : Env.TIME_ACTIVITY_SYNC_LAMBDA_ENDPOINT,
        timeactivitySyncLambdaApiKey: Env === null || Env === void 0 ? void 0 : Env.TIME_ACTIVITY_SYNC_API_KEY,
    };
}
exports.default = Object.assign({}, config(process.env));
