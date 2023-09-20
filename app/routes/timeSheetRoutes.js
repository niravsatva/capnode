"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Get time sheet logs by employee
router.get('/employee', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.getAllTimeSheetLogs);
// Get all time sheets
router.get('/', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.getAllTimeSheets);
// Create new time sheet by date
router.post('/', authMiddleware_1.isAuthenticated, validators_1.createTimeSheetValidator, controllers_1.timeSheetController.createTimeSheetByDate);
// Email time sheet
router.post('/email', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.emailTimeSheet);
exports.default = router;
