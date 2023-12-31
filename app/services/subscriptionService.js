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
const repositories_1 = require("../repositories");
class SubscriptionService {
    getSubscriptionDetails(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyRole = yield prisma_1.prisma.companyRole.findFirst({
                where: {
                    userId: query.userId,
                    companyId: query.companyId
                }
            });
            if (!companyRole) {
                throw new customError_1.CustomError(400, 'You are not authorized to access details of this company');
            }
            const subscriptionData = yield repositories_1.subscriptionRepository.getSubscriptionDetailsByCompanyIdOrUserId(query.companyId, query.userId);
            return subscriptionData;
        });
    }
    cancelSubscription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionData = yield repositories_1.subscriptionRepository.getSubscriptionDetailsByZohoSubscriptionId(data.subscription_id);
            if (!subscriptionData) {
                throw new customError_1.CustomError(400, 'Subscription not found');
            }
            yield prisma_1.prisma.subscription.updateMany({
                where: {
                    zohoSubscriptionId: data.subscription_id
                },
                data: {
                    status: data.status
                }
            });
            if (subscriptionData.companyId) {
                yield prisma_1.prisma.company.update({
                    where: {
                        id: subscriptionData.companyId
                    },
                    data: {
                        isConnected: false,
                        status: false
                    }
                });
            }
        });
    }
    renewSubscription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionData = yield repositories_1.subscriptionRepository.getSubscriptionDetailsByZohoSubscriptionId(data.subscription_id);
            if (!subscriptionData) {
                throw new customError_1.CustomError(400, 'Subscription not found');
            }
            yield prisma_1.prisma.subscription.updateMany({
                where: {
                    zohoSubscriptionId: data.subscription_id
                },
                data: {
                    status: data.status,
                    expiresAt: data.expires_at,
                }
            });
        });
    }
    reactiveSubscription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionData = yield repositories_1.subscriptionRepository.getSubscriptionDetailsByZohoSubscriptionId(data.subscription_id);
            if (!subscriptionData) {
                throw new customError_1.CustomError(400, 'Subscription not found');
            }
            yield prisma_1.prisma.subscription.updateMany({
                where: {
                    zohoSubscriptionId: data.subscription_id
                },
                data: {
                    status: data.status,
                    expiresAt: data.expires_at,
                }
            });
            if (subscriptionData.companyId) {
                yield prisma_1.prisma.company.update({
                    where: {
                        id: subscriptionData.companyId
                    },
                    data: {
                        status: true
                    }
                });
            }
        });
    }
    expireSubscription(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionData = yield repositories_1.subscriptionRepository.getSubscriptionDetailsByZohoSubscriptionId(data.subscription_id);
            if (!subscriptionData) {
                throw new customError_1.CustomError(400, 'Subscription not found');
            }
            yield prisma_1.prisma.subscription.updateMany({
                where: {
                    zohoSubscriptionId: data.subscription_id
                },
                data: {
                    status: data.status,
                    expiresAt: data.expires_at,
                }
            });
        });
    }
}
exports.default = new SubscriptionService();
