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
class SubscriptionRepository {
    createSubscription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.subscription.create({
                data
            });
        });
    }
    updateSubscription(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.subscription.update({
                where: {
                    id
                },
                data
            });
        });
    }
    updateOrCreateSubscriptionByCompanyId(companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const findSubscription = yield prisma_1.prisma.subscription.findFirst({
                where: {
                    companyId
                }
            });
            if (findSubscription) {
                return prisma_1.prisma.subscription.updateMany({
                    where: {
                        companyId: companyId,
                        userId: data.userId
                    },
                    data
                });
            }
            yield prisma_1.prisma.subscription.create({
                data: Object.assign(Object.assign({}, data), { companyId })
            });
        });
    }
    findSubscriptionByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.subscription.findFirst({
                where: {
                    userId
                }
            });
        });
    }
    findSubscriptionByUserIdWithNullCompany(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.subscription.findFirst({
                where: {
                    userId,
                    companyId: null
                }
            });
        });
    }
    getSubscriptionDetailsByCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.subscription.findFirst({
                where: {
                    companyId
                }
            });
        });
    }
    getSubscriptionDetailsByZohoSubscriptionId(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.subscription.findFirst({
                where: {
                    zohoSubscriptionId: subscriptionId
                }
            });
        });
    }
}
exports.default = new SubscriptionRepository();
