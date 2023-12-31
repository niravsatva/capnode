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
const utils_1 = require("../utils/utils");
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
                    ],
                };
            }
            let filterCondition = {};
            if (query.status) {
                filterCondition = {
                    isActive: query.status === 'Active',
                };
            }
            const content = yield prisma_1.prisma.customRules.findMany({
                where: Object.assign(Object.assign({ companyId: query.companyId }, filterCondition), searchCondition),
                orderBy: {
                    priority: 'asc',
                },
            });
            const count = yield prisma_1.prisma.customRules.count({
                where: Object.assign(Object.assign({ companyId: query.companyId }, filterCondition), searchCondition),
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
            const searchQuery = {
                name: data.name,
                companyId: data.companyId,
                id: {
                    not: id,
                },
            };
            if (!id) {
                delete searchQuery.id;
            }
            const checkExistsRule = yield prisma_1.prisma.customRules.findFirst({
                where: searchQuery,
            });
            if (checkExistsRule && checkExistsRule.id) {
                throw new customError_1.CustomError(400, 'Custom rule already exists with same name');
            }
            this.validateCriteriaJson(data.criteria);
            if (id) {
                data.updatedBy = userId;
                return yield prisma_1.prisma.customRules.update({
                    where: {
                        id,
                    },
                    data,
                });
            }
            const allRules = yield prisma_1.prisma.customRules.findMany({
                where: {
                    companyId: data.companyId,
                },
            });
            return prisma_1.prisma.customRules.create({
                data: Object.assign(Object.assign({}, data), { priority: allRules.length + 1 }),
            });
        });
    }
    validateCriteriaJson(criteria) {
        const operators = ['AND', 'OR'];
        if (!(0, utils_1.hasText)(criteria.employeeId)) {
            throw new customError_1.CustomError(400, 'Invalid rule criteria');
        }
        if (!operators.includes(criteria.operator1) ||
            !operators.includes(criteria.operator2)) {
            throw new customError_1.CustomError(400, 'Invalid rule criteria');
        }
        // if (operators.includes(criteria.operator1)) {
        // 	if (!hasText(criteria.customerId)) {
        // 		throw new CustomError(400, 'Invalid rule criteria');
        // 	}
        // }
        // if (operators.includes(criteria.operator2)) {
        // 	if (!hasText(criteria.classId)) {
        // 		throw new CustomError(400, 'Invalid rule criteria');
        // 	}
        // }
        // if (
        // 	hasText(criteria.employeeId) &&
        // 	hasText(criteria.customerId) &&
        // 	hasText(criteria.classId)
        // ) {
        // 	if (
        // 		!operators.includes(criteria.operator1) &&
        // 		!operators.includes(criteria.operator2)
        // 	) {
        // 		throw new CustomError(400, 'Invalid rule criteria');
        // 	}
        // }
        // if (
        // 	hasText(criteria.employeeId) &&
        // 	!hasText(criteria.customerId) &&
        // 	hasText(criteria.classId)
        // ) {
        // 	if (!operators.includes(criteria.operator2)) {
        // 		throw new CustomError(400, 'Invalid rule criteria');
        // 	}
        // }
        // if (
        // 	hasText(criteria.employeeId) &&
        // 	hasText(criteria.customerId) &&
        // 	!hasText(criteria.classId)
        // ) {
        // 	if (!operators.includes(criteria.operator1)) {
        // 		throw new CustomError(400, 'Invalid rule criteria');
        // 	}
        // }
    }
    getCustomRuleById(id, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield prisma_1.prisma.customRules.findFirst({
                where: {
                    id,
                    companyId,
                },
            });
            if (!data) {
                throw new customError_1.CustomError(400, 'Invalid Id');
            }
            return data;
        });
    }
    deleteCustomRuleById(id, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rule = yield prisma_1.prisma.customRules.findUniqueOrThrow({
                where: {
                    id: id,
                },
            });
            yield prisma_1.prisma.customRules.deleteMany({
                where: {
                    id,
                    companyId,
                },
            });
            yield prisma_1.prisma.customRules.updateMany({
                where: {
                    companyId,
                    priority: {
                        gt: rule.priority,
                    },
                },
                data: {
                    priority: {
                        decrement: 1,
                    },
                },
            });
        });
    }
    updatePriority(data, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.length) {
                return;
            }
            yield Promise.all(data.map((rule) => __awaiter(this, void 0, void 0, function* () {
                yield prisma_1.prisma.customRules.updateMany({
                    where: {
                        id: rule.id,
                        companyId,
                    },
                    data: {
                        priority: Number(rule.priority),
                    },
                });
            })));
        });
    }
}
exports.default = new CustomRuleService();
