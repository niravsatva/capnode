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
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const customError_1 = require("../models/customError");
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
class SubscriptionController {
    getLoggedInCompanySubscriptionDetails(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!((_a = req.query) === null || _a === void 0 ? void 0 : _a.companyId)) {
                    throw new customError_1.CustomError(400, 'Company Id is required');
                }
                const data = yield subscriptionService_1.default.getSubscriptionDetails({
                    userId: req.user.id,
                    companyId: req.query.companyId
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Subscription fetched successfully', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    cancelSubscription(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                if (data) {
                    yield subscriptionService_1.default.cancelSubscription(data.subscription);
                }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Subscription canceled successfully', { success: true });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new SubscriptionController();
