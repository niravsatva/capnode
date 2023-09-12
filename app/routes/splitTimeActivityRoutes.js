"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validators_1 = require("../helpers/validators");
const router = express_1.default.Router();
// Get time activity details
router.get('/', authMiddleware_1.isAuthenticated, controllers_1.splitTimeActivityController.getAllSplitTimeActivities);
// Create a new split time activity
router.post('/', authMiddleware_1.isAuthenticated, validators_1.createSplitTimeActivity, controllers_1.splitTimeActivityController.createSplitTimeActivities);
// Delete split time activity
router.delete('/', authMiddleware_1.isAuthenticated, validators_1.deleteSplitTimeActivity, controllers_1.splitTimeActivityController.deleteSplitTimeActivity);
exports.default = router;
