"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const developerController_1 = __importDefault(require("../controllers/developerController"));
const developerRoutes = (0, express_1.Router)();
developerRoutes.post('/delete-company', developerController_1.default.deleteCompany);
exports.default = developerRoutes;
