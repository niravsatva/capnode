"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const customRuleController_1 = __importDefault(require("../controllers/customRuleController"));
const validators_1 = require("../helpers/validators");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.isAuthenticated, customRuleController_1.default.getListOfCustomRules);
router.get('/:id', authMiddleware_1.isAuthenticated, customRuleController_1.default.getCustomRuleById);
router.post('/', authMiddleware_1.isAuthenticated, validators_1.customRuleValidation, customRuleController_1.default.createCustomRules);
router.put('/:id', authMiddleware_1.isAuthenticated, customRuleController_1.default.updateCustomRules);
router.delete('/:id', authMiddleware_1.isAuthenticated, customRuleController_1.default.deleteCustomRuleById);
exports.default = router;
