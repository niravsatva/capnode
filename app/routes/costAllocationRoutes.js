"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.isAuthenticated, controllers_1.costAllocationController.getCostAllocation);
router.get('/export-csv', authMiddleware_1.isAuthenticated, controllers_1.costAllocationController.exportCostAllocationCSV);
router.get('/export-pdf', authMiddleware_1.isAuthenticated, controllers_1.costAllocationController.exportCostAllocationPDF);
exports.default = router;
