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
const config_1 = __importDefault(require("../../config"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const repositories_1 = require("../repositories");
const tokenRepository_1 = __importDefault(require("../repositories/tokenRepository"));
const authServices_1 = __importDefault(require("../services/authServices"));
class AuthController {
    // Register User
    register(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = req.body;
                const customer = (_a = data === null || data === void 0 ? void 0 : data.subscription) === null || _a === void 0 ? void 0 : _a.customer;
                const firstName = customer === null || customer === void 0 ? void 0 : customer.first_name;
                const lastName = customer === null || customer === void 0 ? void 0 : customer.last_name;
                const email = (_b = customer === null || customer === void 0 ? void 0 : customer.email) === null || _b === void 0 ? void 0 : _b.toLowerCase();
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
                const user = yield authServices_1.default.register(firstName, lastName, email, customerId);
                // TEMP Until we not create the company
                // const companyData = {
                // 	tenantID: Math.random().toString(),
                // 	tenantName: 'Organization 1',
                // };
                // const company = await companyRepository.create(companyData);
                // await companyRepository?.connectCompany(user.id, company?.id);
                // TEMP END Until we not create the company
                // Uncomment code
                // Create new record in companyRole
                yield repositories_1.companyRoleRepository.create(user === null || user === void 0 ? void 0 : user.id, companyAdminRole === null || companyAdminRole === void 0 ? void 0 : companyAdminRole.id);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'User registration successful, please check your email for accessing your account');
            }
            catch (err) {
                console.log(err);
                next(err);
            }
        });
    }
    // Login User
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { email, password, machineId } = req.body;
                const { accessToken, refreshToken, user } = yield authServices_1.default.login(email === null || email === void 0 ? void 0 : email.toLowerCase(), password, machineId);
                console.log('Access token: ' + accessToken + ' refresh token: ' + refreshToken);
                // req.session.accessToken = accessToken;
                // req.session.refreshToken = refreshToken;
                const { password: userPassword, forgotPasswordToken, forgotPasswordTokenExpiresAt, isVerified } = user, finalUser = __rest(user, ["password", "forgotPasswordToken", "forgotPasswordTokenExpiresAt", "isVerified"]);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User logged in successfully', Object.assign(Object.assign({}, finalUser), { accessToken,
                    refreshToken }));
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
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Please check your inbox. If you have account with us you got email with reset instruction.'
                // 'Password reset link sent to your email address'
                );
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
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _d = req.body, { email } = _d, data = __rest(_d, ["email"]);
                if ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.location) {
                    const fileUrl = req.file.location.replace(config_1.default.s3BaseUrl, '');
                    data.profileImg = fileUrl;
                }
                // Form data giving the null in string
                if (data.profileImg === 'null') {
                    data.profileImg = null;
                }
                const profile = yield repositories_1.userRepository.update(req.user.id, data);
                // If the user has bought a subscription then there is no company or role assigned to that user
                const user = yield repositories_1.companyRoleRepository.getRecordWithNullCompanyId(req.user.id);
                let profileData;
                if (user.length > 0) {
                    // Check if the user is companyAdmin
                    const isCompanyAdmin = yield repositories_1.roleRepository.checkCompanyAdminRole((_c = (_b = user[0]) === null || _b === void 0 ? void 0 : _b.role) === null || _c === void 0 ? void 0 : _c.id);
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
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Profile updated successfully', profileData);
            }
            catch (err) {
                console.log(err);
                next(err);
            }
        });
    }
    // Logout
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = req.accessToken;
                const refreshToken = req.refreshToken;
                const machineId = req.body.machineId;
                const deleted = yield tokenRepository_1.default.delete(req.user.id, accessToken, refreshToken, machineId);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User logged out successfully');
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new AuthController();
