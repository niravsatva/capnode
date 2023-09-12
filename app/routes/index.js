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
const router = express_1.default.Router();
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
router.use('/test', (req, res) => {
    return res.json({ data: 'Hello world!' });
});
router.use(errorHandler_1.notFound);
router.use(errorHandler_1.customError);
exports.default = router;
