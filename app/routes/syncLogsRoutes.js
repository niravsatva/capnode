"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const syncLogController_1 = __importDefault(require("../controllers/syncLogController"));
const router = express_1.default.Router();
router.get('/', syncLogController_1.default.getSyncLogs);
exports.default = router;
