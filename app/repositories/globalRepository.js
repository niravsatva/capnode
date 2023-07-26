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
class GlobalRepository {
    constructor() {
        this.isAdminUser = (userId, companyId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield prisma_1.prisma.companyRole.findFirst({
                where: {
                    userId,
                    companyId,
                },
                include: {
                    role: true,
                },
            });
            if ((response === null || response === void 0 ? void 0 : response.role.isCompanyAdmin) || (response === null || response === void 0 ? void 0 : response.role.isAdminRole)) {
                return true;
            }
            else {
                return false;
            }
        });
    }
}
exports.default = new GlobalRepository();
