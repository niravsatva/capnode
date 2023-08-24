"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const employeeCostRouter = (0, express_1.Router)();
employeeCostRouter.get('/', controllers_1.employeeCostController.getMonthlyCost);
employeeCostRouter.post('/', controllers_1.employeeCostController.createMonthlyCost);
employeeCostRouter.put('/', controllers_1.employeeCostController.updateMonthlyCost);
exports.default = employeeCostRouter;
