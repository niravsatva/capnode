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
router.get('/callback', zohoController_1.default.callback);
router.post('/get-token', zohoController_1.default.getToken);
router.get('/hosted-page', authMiddleware_1.isAuthenticated, zohoController_1.default.createHostedPage);
exports.default = router;
