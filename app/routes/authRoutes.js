"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = require("../helpers/multer");
const router = express_1.default.Router();
// Login
router.post('/login', validators_1.loginValidationRules, controllers_1.authController.login);
// Logout
router.post('/logout', authMiddleware_1.isAuthenticated, controllers_1.authController.logout);
// Register User
router.post('/register', controllers_1.authController.register);
// Forgot password
router.post('/forgot-password', validators_1.forgotPasswordValidationRules, controllers_1.authController.forgotPassword);
// Verify forgot password token
router.post('/verify-forgot-password', controllers_1.authController.verifyForgotPasswordToken);
// Change Password
router.post('/change-password/:token', validators_1.changePasswordValidationRules, controllers_1.authController.changePassword);
// Fetch Profile
router.get('/fetch-profile', authMiddleware_1.isAuthenticated, controllers_1.authController.fetchProfile);
// Update Profile
router.put('/', authMiddleware_1.isAuthenticated, multer_1.updateProfileMiddleware.single('profileImg'), validators_1.updateProfileValidationRules, controllers_1.authController.updateProfile);
exports.default = router;
