"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employeeController_1 = __importDefault(require("../controllers/employeeController"));
const validators_1 = require("../helpers/validators");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get all employees from db
router.post('/', validators_1.employeeValidation, employeeController_1.default.getAllEmployees);
// Sync when company connect
router.post('/sync', validators_1.employeeValidation, authMiddleware_1.isAuthenticated, employeeController_1.default.syncEmployees);
exports.default = router;
