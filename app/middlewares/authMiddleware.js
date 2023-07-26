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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.refreshAccessToken = void 0;
const tokenHelper_1 = require("../helpers/tokenHelper");
const customError_1 = require("../models/customError");
const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the refresh token is valid
        const verified = (0, tokenHelper_1.verifyRefreshToken)(refreshToken);
        if (!verified) {
            const error = new customError_1.CustomError(401, 'Invalid refresh token');
            throw error;
        }
        // Generate new access token
        const newAccessToken = (0, tokenHelper_1.generateAccessToken)({
            id: verified === null || verified === void 0 ? void 0 : verified.id,
            email: verified === null || verified === void 0 ? void 0 : verified.email,
        });
        // Generate new refresh token
        const newRefreshToken = (0, tokenHelper_1.generateRefreshToken)({
            id: verified === null || verified === void 0 ? void 0 : verified.id,
            email: verified === null || verified === void 0 ? void 0 : verified.email,
        });
        return { newAccessToken, newRefreshToken };
    }
    catch (err) {
        if (err.name == 'TokenExpiredError') {
            const error = new customError_1.CustomError(401, 'Token expired');
            throw error;
        }
        else {
            throw err;
        }
    }
});
exports.refreshAccessToken = refreshAccessToken;
const isAuthenticated = (req, res, next) => {
    try {
        // Get the refresh token from the session
        const accessToken = req.session.accessToken;
        // Get the refresh token from the session
        const refreshToken = req.session.refreshToken;
        // Check if access token and refresh token are present
        if (!accessToken || !refreshToken) {
            const error = new customError_1.CustomError(401, 'Your session has expired, please login again');
            return next(error);
        }
        // Verify the access token
        const verifiedAccessToken = (0, tokenHelper_1.verifyAccessToken)(accessToken);
        req.user = {
            id: verifiedAccessToken === null || verifiedAccessToken === void 0 ? void 0 : verifiedAccessToken.id,
            email: verifiedAccessToken === null || verifiedAccessToken === void 0 ? void 0 : verifiedAccessToken.email,
        };
        if (!verifiedAccessToken) {
            const error = new customError_1.CustomError(401, 'Invalid access token');
            return next(error);
        }
        // // Verify the refresh token
        // if (!verifyRefreshToken(refreshToken!)) {
        //   const error = new CustomError(401, "Invalid refresh token");
        //   return next(error);
        // }
        // Tokens are valid, proceed to the next middleware or route
        next();
    }
    catch (err) {
        if (err.name == 'TokenExpiredError') {
            (0, exports.refreshAccessToken)(req.session.refreshToken)
                .then((data) => {
                req.session.accessToken = data === null || data === void 0 ? void 0 : data.newAccessToken;
                req.session.refreshToken = data === null || data === void 0 ? void 0 : data.newRefreshToken;
                next();
            })
                .catch((err) => {
                next(err);
            });
        }
        else {
            next(err);
        }
    }
};
exports.isAuthenticated = isAuthenticated;
