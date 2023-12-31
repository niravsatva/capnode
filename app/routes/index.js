"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../helpers/errorHandler");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const companyRoutes_1 = __importDefault(require("./companyRoutes"));
const roleRoutes_1 = __importDefault(require("./roleRoutes"));
const permissionRoutes_1 = __importDefault(require("./permissionRoutes"));
const quickbooksRoutes_1 = __importDefault(require("./quickbooksRoutes"));
const employeeRoutes_1 = __importDefault(require("./employeeRoutes"));
const timeActivityRoutes_1 = __importDefault(require("./timeActivityRoutes"));
const splitTimeActivityRoutes_1 = __importDefault(require("./splitTimeActivityRoutes"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const configuration_1 = __importDefault(require("./configuration"));
const employeeCostRoutes_1 = __importDefault(require("./employeeCostRoutes"));
const timeSheetRoutes_1 = __importDefault(require("./timeSheetRoutes"));
const payPeriodRoutes_1 = __importDefault(require("./payPeriodRoutes"));
const costAllocationRoutes_1 = __importDefault(require("./costAllocationRoutes"));
const journalRoutes_1 = __importDefault(require("./journalRoutes"));
const dashboardRoutes_1 = __importDefault(require("./dashboardRoutes"));
const syncLogsRoutes_1 = __importDefault(require("./syncLogsRoutes"));
const developerRoutes_1 = __importDefault(require("./developerRoutes"));
const reportRoutes_1 = __importDefault(require("./reportRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./subscriptionRoutes"));
const zohoRoutes_1 = __importDefault(require("./zohoRoutes"));
const requestLogger_1 = require("../middlewares/requestLogger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("../config/swagger"));
const customRuleRoutes_1 = __importDefault(require("../routes/customRuleRoutes"));
const router = express_1.default.Router();
router.use(requestLogger_1.requestLogger);
router.use('/auth', authRoutes_1.default);
router.use('/users', authMiddleware_1.isAuthenticated, userRoutes_1.default);
router.use('/companies', authMiddleware_1.isAuthenticated, companyRoutes_1.default);
router.use('/role', authMiddleware_1.isAuthenticated, roleRoutes_1.default);
router.use('/permission', permissionRoutes_1.default);
router.use('/quickbooks', quickbooksRoutes_1.default);
router.use('/employees', employeeRoutes_1.default);
router.use('/time-activities', timeActivityRoutes_1.default);
router.use('/configuration', configuration_1.default);
router.use('/employee-cost', employeeCostRoutes_1.default);
router.use('/split-time-activity', splitTimeActivityRoutes_1.default);
router.use('/time-sheet', timeSheetRoutes_1.default);
router.use('/pay-periods', payPeriodRoutes_1.default);
router.use('/cost-allocation', costAllocationRoutes_1.default);
router.use('/journal', journalRoutes_1.default);
router.use('/dashboard', dashboardRoutes_1.default);
router.use('/sync-logs', syncLogsRoutes_1.default);
router.use('/developer', developerRoutes_1.default);
router.use('/reports', reportRoutes_1.default);
router.use('/subscription', subscriptionRoutes_1.default);
router.use('/zoho', zohoRoutes_1.default);
router.use('/custom-rule', customRuleRoutes_1.default);
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test api
 *     description: Testing api
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to login
 *     responses:
 *       200:
 *         description: Success
 */
router.use('/test', (req, res) => {
    return res.json({ data: 'Hello world!' });
});
router.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
router.use(errorHandler_1.notFound);
router.use(errorHandler_1.customError);
exports.default = router;
