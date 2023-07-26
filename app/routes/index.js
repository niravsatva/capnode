"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const authMiddleware_1 = require("../middlewares/authMiddleware");
const prisma_1 = require("../client/prisma");
const router = express_1.default.Router();
router.get('/test', (req, res) => {
    return res.json({ data: 'Hello world!' });
});
router.post('/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield prisma_1.prisma.user.findFirst();
        console.log('companies: ', companies);
        return res.json({ data: companies });
    }
    catch (err) {
        return res.json(err);
    }
}));
router.use('/auth', authRoutes_1.default);
router.use('/users', authMiddleware_1.isAuthenticated, userRoutes_1.default);
router.use('/companies', authMiddleware_1.isAuthenticated, companyRoutes_1.default);
router.use('/role', authMiddleware_1.isAuthenticated, roleRoutes_1.default);
router.use('/permission', permissionRoutes_1.default);
router.use(errorHandler_1.notFound);
router.use(errorHandler_1.customError);
exports.default = router;
