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
const customError_1 = require("../models/customError");
class CustomRuleService {
    getCustomRuleList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query.companyId) {
                throw new customError_1.CustomError(400, 'CompanyId required');
            }
            let searchCondition = {};
            if (query.search) {
                searchCondition = {
                    OR: [
                        {
                            name: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                    ]
                };
            }
            let filterCondition = {};
            if (query.status) {
                filterCondition = {
                    status: query.status === 'Active'
                };
            }
            const offset = (Number(query.page || 1) - 1) * Number(query.limit || 10);
            const content = yield prisma_1.prisma.customRules.findMany({
                where: Object.assign(Object.assign({ companyId: query.companyId }, filterCondition), searchCondition),
                orderBy: {
                    createdAt: 'desc'
                },
                skip: offset,
                take: Number(query.limit || 10)
            });
            const count = yield prisma_1.prisma.customRules.count({
                where: Object.assign(Object.assign({ companyId: query.companyId }, filterCondition), searchCondition)
            });
            return { content, count };
        });
    }
    saveCustomRule(data, userId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.companyId) {
                throw new customError_1.CustomError(400, 'Invalid companyId');
            }
            data.updatedBy = userId;
            data.createdBy = userId;
            if (id) {
                data.updatedBy = userId;
                return yield prisma_1.prisma.customRules.update({
                    where: {
                        id
                    },
                    data
                });
            }
            return prisma_1.prisma.customRules.create({
                data
            });
        });
    }
    getCustomRuleById(id, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield prisma_1.prisma.customRules.findFirst({
                where: {
                    id,
                    companyId
                }
            });
            if (!data) {
                throw new customError_1.CustomError(400, 'Invalid Id');
            }
            return data;
        });
    }
    deleteCustomRuleById(id, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.customRules.deleteMany({
                where: {
                    id,
                    companyId
                }
            });
        });
    }
}
exports.default = new CustomRuleService();
