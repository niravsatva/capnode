"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payPeriodController_1 = __importDefault(require("../controllers/payPeriodController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validators_1 = require("../helpers/validators");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.isAuthenticated, payPeriodController_1.default.getAllPayPeriods);
router.get('/dates', authMiddleware_1.isAuthenticated, payPeriodController_1.default.getDisabledDate);
router.post('/', authMiddleware_1.isAuthenticated, validators_1.payPeriodValidator, payPeriodController_1.default.createPayPeriod);
router.put('/:id', authMiddleware_1.isAuthenticated, validators_1.payPeriodValidator, payPeriodController_1.default.editPayPeriod);
exports.default = router;
