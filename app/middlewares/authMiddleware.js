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
exports.isAuthenticated = exports.refreshAccessToken = void 0;
const tokenHelper_1 = require("../helpers/tokenHelper");
// import { RequestExtended } from '../interfaces/global';
const customError_1 = require("../models/customError");
const tokenRepository_1 = __importDefault(require("../repositories/tokenRepository"));
const refreshAccessToken = (accessToken, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
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
        const isValid = yield (0, tokenHelper_1.checkTokens)(verified === null || verified === void 0 ? void 0 : verified.id, accessToken, refreshToken);
        if (!isValid) {
            const error = new customError_1.CustomError(401, 'Token expired');
            throw error;
        }
        yield (tokenRepository_1.default === null || tokenRepository_1.default === void 0 ? void 0 : tokenRepository_1.default.updateTokens(verified === null || verified === void 0 ? void 0 : verified.id, accessToken, refreshToken, newAccessToken, newRefreshToken));
        return { newAccessToken, newRefreshToken, verified };
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
// export const isAuthenticated = (
// 	req: RequestExtended,
// 	res: Response,
// 	next: NextFunction
// ) => {
// 	try {
// 		// Get the refresh token from the session
// 		const accessToken = req.session.accessToken;
// 		// Get the refresh token from the session
// 		const refreshToken = req.session.refreshToken;
// 		// Check if access token and refresh token are present
// 		if (!accessToken || !refreshToken) {
// 			const error = new CustomError(
// 				401,
// 				'Your session has expired, please login again'
// 			);
// 			return next(error);
// 		}
// 		// Verify the access token
// 		const verifiedAccessToken: any = verifyAccessToken(accessToken);
// 		req.user = {
// 			id: verifiedAccessToken?.id,
// 			email: verifiedAccessToken?.email,
// 		};
// 		if (!verifiedAccessToken) {
// 			const error = new CustomError(401, 'Invalid access token');
// 			return next(error);
// 		}
// 		// // Verify the refresh token
// 		// if (!verifyRefreshToken(refreshToken!)) {
// 		//   const error = new CustomError(401, "Invalid refresh token");
// 		//   return next(error);
// 		// }
// 		// Tokens are valid, proceed to the next middleware or route
// 		next();
// 	} catch (err: any) {
// 		if (err.name == 'TokenExpiredError') {
// 			refreshAccessToken(req.session.refreshToken)
// 				.then((data: any) => {
// 					req.session.accessToken = data?.newAccessToken;
// 					req.session.refreshToken = data?.newRefreshToken;
// 					next();
// 				})
// 				.catch((err) => {
// 					next(err);
// 				});
// 		} else {
// 			next(err);
// 		}
// 	}
// };
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // Fetch Token from Header
        const accessToken = (_b = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
        const refreshToken = (_d = (_c = req === null || req === void 0 ? void 0 : req.headers) === null || _c === void 0 ? void 0 : _c.refreshtoken) === null || _d === void 0 ? void 0 : _d.split(' ')[1];
        // const refreshToken = req?.headers?.authorization?.split(' ')[1] as any;
        //   Token Is not Available
        if (!accessToken || !refreshToken) {
            const error = new customError_1.CustomError(401, 'Unauthorized user');
            return next(error);
        }
        // Verify the access token
        const verifiedAccessToken = yield (0, tokenHelper_1.verifyAccessToken)(accessToken);
        req.user = {
            id: verifiedAccessToken === null || verifiedAccessToken === void 0 ? void 0 : verifiedAccessToken.id,
            email: verifiedAccessToken === null || verifiedAccessToken === void 0 ? void 0 : verifiedAccessToken.email,
        };
        req.accessToken = accessToken;
        req.refreshToken = refreshToken;
        if (!verifiedAccessToken) {
            const error = new customError_1.CustomError(401, 'Invalid access token');
            return next(error);
        }
        const isValid = yield (0, tokenHelper_1.checkTokens)(verifiedAccessToken === null || verifiedAccessToken === void 0 ? void 0 : verifiedAccessToken.id, accessToken, refreshToken);
        if (!isValid) {
            const error = new customError_1.CustomError(401, 'Token expired');
            return next(error);
        }
        next();
    }
    catch (err) {
        next(err);
        // if (err.name == 'TokenExpiredError') {
        // 	next(err);
        // const accessToken = req?.headers?.authorization?.split(' ')[1] as any;
        // const refreshToken = req?.headers?.refreshtoken?.split(' ')[1] as any;
        // refreshAccessToken(accessToken, refreshToken)
        // 	.then((res) => {
        // 		req.user = {
        // 			id: res?.verified?.id,
        // 			user: res?.verified?.user,
        // 		};
        // 		next();
        // 	})
        // 	.catch((err) => {
        // 		next(err);
        // 	});
        // } else {
        // 	next(err);
        // }
    }
});
exports.isAuthenticated = isAuthenticated;
