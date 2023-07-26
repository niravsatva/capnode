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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const customError_1 = require("../models/customError");
const authServices_1 = __importDefault(require("../services/authServices"));
const repositories_1 = require("../repositories");
class AuthController {
    // Register User
    register(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                const customer = (_a = data === null || data === void 0 ? void 0 : data.subscription) === null || _a === void 0 ? void 0 : _a.customer;
                const firstName = customer === null || customer === void 0 ? void 0 : customer.first_name;
                const lastName = customer === null || customer === void 0 ? void 0 : customer.last_name;
                const email = customer === null || customer === void 0 ? void 0 : customer.email;
                const customerId = customer === null || customer === void 0 ? void 0 : customer.customer_id;
                let companyAdminRole;
                // Check if company admin role exists
                companyAdminRole = yield repositories_1.roleRepository.checkAdmin('Company Admin');
                if (!companyAdminRole) {
                    companyAdminRole = yield repositories_1.roleRepository.createRole('Company Admin', 'All company permissions granted', false, true);
                }
                // Check if admin role exists
                const isAdminExist = yield repositories_1.roleRepository.checkAdmin('admin');
                if (!isAdminExist) {
                    yield repositories_1.roleRepository.createRole('Admin', 'All permissions granted', true, false);
                }
                // Create new user
                const user = yield authServices_1.default.register(firstName, lastName, email.toLowerCase(), customerId);
                // Create new record in companyRole
                yield repositories_1.companyRoleRepository.create(user === null || user === void 0 ? void 0 : user.id, companyAdminRole === null || companyAdminRole === void 0 ? void 0 : companyAdminRole.id);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'User registration successful, please check your email for accessing your account');
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Login User
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                console.log('req: ', req);
                const { email, password } = req.body;
                const { accessToken, refreshToken, user } = yield authServices_1.default.login(email.toLowerCase(), password);
                req.session.accessToken = accessToken;
                req.session.refreshToken = refreshToken;
                const { password: userPassword, forgotPasswordToken, forgotPasswordTokenExpiresAt, isVerified } = user, finalUser = __rest(user, ["password", "forgotPasswordToken", "forgotPasswordTokenExpiresAt", "isVerified"]);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User logged in successfully', finalUser);
            }
            catch (err) {
                console.log('err: ', err);
                next(err);
            }
        });
    }
    // Logout User
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                        const error = new customError_1.CustomError(500, 'Something went wrong during logout');
                        throw error;
                    }
                    res.clearCookie('connect.sid');
                    return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Logout Successful');
                });
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Forgot Password
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { email } = req.body;
                yield authServices_1.default.forgotPassword(email);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Password reset link sent to your email address');
            }
            catch (err) {
                console.log('Err: ', err);
                next(err);
            }
        });
    }
    // Verify Forgot Password Token
    verifyForgotPasswordToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.query;
                yield authServices_1.default.verifyForgotPassword(token);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Reset Password Token verified successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Change Password
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { password } = req.body;
                const { token } = req.params;
                const user = yield authServices_1.default.changePassword(token, password);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User password changed successfully', user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Fetch Profile
    fetchProfile(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profile = yield repositories_1.userRepository.getById(req.user.id);
                // If the user has bought a subscription then there is no company or role assigned to that user
                const user = yield repositories_1.companyRoleRepository.getRecordWithNullCompanyId(req.user.id);
                let profileData;
                if (user.length > 0) {
                    // Check if the user is companyAdmin
                    const isCompanyAdmin = yield repositories_1.roleRepository.checkCompanyAdminRole((_b = (_a = user[0]) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.id);
                    if (isCompanyAdmin) {
                        profileData = Object.assign(Object.assign({}, profile), { isFirstCompanyAdmin: true });
                    }
                    else {
                        profileData = Object.assign(Object.assign({}, profile), { isFirstCompanyAdmin: false });
                    }
                }
                else {
                    profileData = Object.assign(Object.assign({}, profile), { isFirstCompanyAdmin: false });
                }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Profile fetched successfully', profileData);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Update Profile
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.body, { email } = _a, data = __rest(_a, ["email"]);
                const profile = yield repositories_1.userRepository.update(req.user.id, data);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Profile updated successfully', profile);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new AuthController();
