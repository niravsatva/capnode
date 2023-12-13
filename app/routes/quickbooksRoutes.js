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
// Get Quickbooks Auth URL
router.get('/authurl', authMiddleware_1.isAuthenticated, controllers_1.quickbooksController.getQuickbooksAuthUri);
// Quickbooks Callback
router.post('/callback', authMiddleware_1.isAuthenticated, controllers_1.quickbooksController.quickbooksCallback);
// Get Quickbooks SSO Auth URL
router.get('/sso-authurl', controllers_1.quickbooksController.getQuickbooksSSOAuthUri);
// Get Quickbooks SSO Auth URL
router.post('/sso-callback', controllers_1.quickbooksController.quickbooksSSOCallback);
// Disconnect company
router.post('/disconnect', authMiddleware_1.isAuthenticated, controllers_1.quickbooksController.quickbooksDisconnect);
// Update status
router.put('/', authMiddleware_1.isAuthenticated, controllers_1.quickbooksController.updateCompanyStatus);
router.post('/employees', authMiddleware_1.isAuthenticated, validators_1.quickbooksEmployeeValidation, controllers_1.quickbooksController.getAllQBEmployees);
router.post('/accounts', authMiddleware_1.isAuthenticated, validators_1.quickbooksAccountsValidation, controllers_1.quickbooksController.getAllAccounts);
router.post('/customers', authMiddleware_1.isAuthenticated, validators_1.quickbooksCustomersValidation, controllers_1.quickbooksController.getAllCustomer);
router.post('/customer-options', authMiddleware_1.isAuthenticated, validators_1.quickbooksCustomersValidation, controllers_1.quickbooksController.getCustomerOptions);
router.post('/classes', authMiddleware_1.isAuthenticated, validators_1.quickbooksClassValidation, controllers_1.quickbooksController.getAllClasses);
router.post('/company', controllers_1.quickbooksController.getCompanyInfo);
// Sync time activities for the first time
router.post('/time-activities', authMiddleware_1.isAuthenticated, validators_1.quickbooksTimeActivityValidation, controllers_1.quickbooksController.getAllTimeActivities);
router.get('/closingDate', authMiddleware_1.isAuthenticated, validators_1.companyIdValidation, controllers_1.quickbooksController.getClosingDateList);
router.post('/chart-of-account', authMiddleware_1.isAuthenticated, validators_1.chartOfAccountsValidation, controllers_1.quickbooksController.createChartOfAccount);
exports.default = router;
