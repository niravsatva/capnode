"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
// import { isAuthenticated } from '../middlewares/authMiddleware';
const router = express_1.default.Router();
// Login
router.post('/login', controllers_1.authController.login);
// Logout
router.post('/logout', controllers_1.authController.logout);
// Register User
router.post('/register', controllers_1.authController.register);
// Forgot password
router.post('/forgot-password', validators_1.forgotPasswordValidationRules, controllers_1.authController.forgotPassword);
// Verify forgot password token
router.post('/verify-forgot-password', controllers_1.authController.verifyForgotPasswordToken);
// Change Password
router.post('/change-password/:token', validators_1.changePasswordValidationRules, controllers_1.authController.changePassword);
// Fetch Profile
router.get('/fetch-profile', controllers_1.authController.fetchProfile);
// Update Profile
router.put('/', validators_1.updateProfileValidationRules, controllers_1.authController.updateProfile);
exports.default = router;
