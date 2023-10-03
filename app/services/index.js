"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authServices_1 = __importDefault(require("./authServices"));
const userServices_1 = __importDefault(require("./userServices"));
const roleService_1 = __importDefault(require("./roleService"));
const permissionService_1 = __importDefault(require("./permissionService"));
const employeeServices_1 = __importDefault(require("./employeeServices"));
const timeActivityServices_1 = __importDefault(require("./timeActivityServices"));
const configurationServices_1 = __importDefault(require("./configurationServices"));
const employeeCostServices_1 = __importDefault(require("./employeeCostServices"));
const payPeriodServices_1 = __importDefault(require("./payPeriodServices"));
exports.default = {
    authServices: authServices_1.default,
    userServices: userServices_1.default,
    roleService: roleService_1.default,
    permissionService: permissionService_1.default,
    employeeServices: employeeServices_1.default,
    timeActivityServices: timeActivityServices_1.default,
    configurationServices: configurationServices_1.default,
    employeeCostServices: employeeCostServices_1.default,
    payPeriodServices: payPeriodServices_1.default,
};
