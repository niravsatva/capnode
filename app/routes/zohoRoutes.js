"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zohoController_1 = __importDefault(require("../controllers/zohoController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/sso-login', authMiddleware_1.isAuthenticated, zohoController_1.default.SSOLogin);
exports.default = router;
