"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionController_1 = __importDefault(require("../controllers/subscriptionController"));
const subscriptionRoutes = express_1.default.Router();
subscriptionRoutes.get('/logged-in', subscriptionController_1.default.getLoggedInCompanySubscriptionDetails);
exports.default = subscriptionRoutes;
