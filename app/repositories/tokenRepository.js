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
const prisma_1 = require("../client/prisma");
class TokenRepository {
    create(userId, accessToken, refreshToken, machineId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = yield prisma_1.prisma.token.create({
                    data: {
                        userId: userId,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        machineId: machineId,
                    },
                });
                return token;
            }
            catch (err) {
                throw err;
            }
        });
    }
    delete(userId, accessToken, refreshToken, machineId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = yield prisma_1.prisma.token.deleteMany({
                    where: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        userId: userId,
                        machineId: machineId,
                    },
                });
                return token;
            }
            catch (err) {
                throw err;
            }
        });
    }
    updateTokens(userId, accessToken, refreshToken, newAccessToken, newRefreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = yield prisma_1.prisma.token.updateMany({
                    where: {
                        userId: userId,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    },
                    data: {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    },
                });
                return token;
            }
            catch (err) {
                throw err;
            }
        });
    }
    findToken(userId, accessToken, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = yield prisma_1.prisma.token.findMany({
                    where: {
                        userId: userId,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    },
                });
                if (token && (token === null || token === void 0 ? void 0 : token.length) > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new TokenRepository();
