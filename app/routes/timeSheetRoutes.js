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
// router.get(
// 	'/employee',
// 	isAuthenticated,
// 	timeSheetController.getAllTimeSheetLogs
// );
router.get('/employees', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.getTimeSheetWiseEmployees);
// Get all time sheets
router.get('/', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.getAllTimeSheets);
router.get('/by-payPeriod', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.getTimeSheetByPayPeriod);
// Get time sheet details
router.get('/:id', authMiddleware_1.isAuthenticated, controllers_1.timeSheetController.getTimeSheetDetails);
// Create new time sheet by date
router.post('/', authMiddleware_1.isAuthenticated, validators_1.createTimeSheetValidator, controllers_1.timeSheetController.createTimeSheet);
// Email time sheet
router.post('/email', authMiddleware_1.isAuthenticated, validators_1.timeSheetEmailValidators, controllers_1.timeSheetController.emailTimeSheet);
// Export time sheet
router.post('/export', authMiddleware_1.isAuthenticated, validators_1.timeSheetExportValidators, controllers_1.timeSheetController.exportTimeSheetPdf);
exports.default = router;
