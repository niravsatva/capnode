"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// import { employeeValidation } from '../helpers/validators';
const router = express_1.default.Router();
// Sync time activities
router.post('/sync', authMiddleware_1.isAuthenticated, validators_1.timeActivityValidation, controllers_1.timeActivityController.syncTimeActivities);
// Get all time activities from db
router.post('/', authMiddleware_1.isAuthenticated, validators_1.timeActivityValidation, controllers_1.timeActivityController === null || controllers_1.timeActivityController === void 0 ? void 0 : controllers_1.timeActivityController.getAllTimeActivities);
// Update time activity
router.put('/', authMiddleware_1.isAuthenticated, validators_1.updateTimeActivityValidation, controllers_1.timeActivityController === null || controllers_1.timeActivityController === void 0 ? void 0 : controllers_1.timeActivityController.updateTimeActivity);
// Create time activity
router.post('/create', authMiddleware_1.isAuthenticated, validators_1.createTimeActivityValidation, controllers_1.timeActivityController === null || controllers_1.timeActivityController === void 0 ? void 0 : controllers_1.timeActivityController.createTimeActivity);
// Delete time activity
router.delete('/', authMiddleware_1.isAuthenticated, validators_1.deleteTimeActivityValidation, controllers_1.timeActivityController === null || controllers_1.timeActivityController === void 0 ? void 0 : controllers_1.timeActivityController.deleteTimeActivity);
// Export time activity
router.get('/export', authMiddleware_1.isAuthenticated, controllers_1.timeActivityController.exportTimeActivity);
exports.default = router;
