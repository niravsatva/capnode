"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyForgotPasswordToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateForgotPasswordToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
// Generate AccessToken
const generateAccessToken = (payload) => {
    // expiresIn works in seconds if given in number
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.accessTokenSecretKey, {
        expiresIn: config_1.default.accessTokenExpireTime,
    });
    return token;
};
exports.generateAccessToken = generateAccessToken;
// Generate RefreshToken
const generateRefreshToken = (payload) => {
    // expiresIn works in seconds if given in number
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.refreshTokenSecretKey, {
        expiresIn: config_1.default.refreshTokenExpireTime,
    });
    return token;
};
exports.generateRefreshToken = generateRefreshToken;
// Generate Forgot Password Token
const generateForgotPasswordToken = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.forgotPasswordTokenSecretKey);
    return token;
};
exports.generateForgotPasswordToken = generateForgotPasswordToken;
// Verify Access Token
const verifyAccessToken = (accessToken) => {
    const verified = jsonwebtoken_1.default.verify(accessToken, config_1.default.accessTokenSecretKey);
    return verified;
};
exports.verifyAccessToken = verifyAccessToken;
// Verify Refresh Token
const verifyRefreshToken = (refreshToken) => {
    const verified = jsonwebtoken_1.default.verify(refreshToken, config_1.default.refreshTokenSecretKey);
    return verified;
};
exports.verifyRefreshToken = verifyRefreshToken;
// Verify Forgot Password Token
const verifyForgotPasswordToken = (forgotPasswordToken) => {
    const verified = jsonwebtoken_1.default.verify(forgotPasswordToken, config_1.default.forgotPasswordTokenSecretKey);
    return verified;
};
exports.verifyForgotPasswordToken = verifyForgotPasswordToken;
