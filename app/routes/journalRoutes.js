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
// Get all journal entries
router.get('/entries', authMiddleware_1.isAuthenticated, controllers_1.journalController.getJournalEntries);
// Create or Update journals
router.post('/create', authMiddleware_1.isAuthenticated, validators_1.journalValidator, controllers_1.journalController.createJournal);
//Get all journals
router.get('/', authMiddleware_1.isAuthenticated, controllers_1.journalController.getAllJournals);
//Get latest journal no
router.get('/latest-no', authMiddleware_1.isAuthenticated, controllers_1.journalController.getLatestJournalNo);
//Get Journal By PayPeriod
router.get('/by-payPeriod', authMiddleware_1.isAuthenticated, controllers_1.journalController.getJournalByPayPeriod);
exports.default = router;
