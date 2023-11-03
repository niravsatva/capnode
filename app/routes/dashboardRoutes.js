"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = __importDefault(require("../controllers/dashboardController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const dashboardRoutes = (0, express_1.Router)();
dashboardRoutes.get('/salary-by-month', authMiddleware_1.isAuthenticated, dashboardController_1.default.getSalaryExpenseByMonth);
dashboardRoutes.get('/salary-by-customer', authMiddleware_1.isAuthenticated, dashboardController_1.default.getExpensesByCustomer);
dashboardRoutes.get('/summary-by-payPeriod', authMiddleware_1.isAuthenticated, dashboardController_1.default.getJournalGraphData);
exports.default = dashboardRoutes;
