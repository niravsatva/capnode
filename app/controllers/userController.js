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
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const passwordHelper_1 = require("../helpers/passwordHelper");
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const userServices_1 = __importDefault(require("../services/userServices"));
const validationHelper_1 = require("../helpers/validationHelper");
const companyRoleRepository_1 = __importDefault(require("../repositories/companyRoleRepository"));
const emailHelper_1 = __importDefault(require("../helpers/emailHelper"));
const repositories_1 = require("../repositories");
const config_1 = __importDefault(require("../../config"));
const emailTemplateHelper_1 = require("../helpers/emailTemplateHelper");
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const customError_1 = require("../models/customError");
class UserController {
    // Get All Users
    getAllUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, search, filter, type, sort, company, } = req.query;
                if (!company) {
                    throw new customError_1.CustomError(403, 'Company not found');
                }
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, company, {
                    permissionName: 'Users',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const { users, total } = yield userServices_1.default.getAllUsers(company, Number(page), Number(limit), search, filter, type, sort);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Users fetched successfully', users, total, Number(page));
            }
            catch (err) {
                console.log(err);
                next(err);
            }
        });
    }
    // Get User Details
    getUserDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const user = yield userServices_1.default.getUserById(id);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User details fetched successfully', user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Create User
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password } = req.body;
                const hashedPassword = yield (0, passwordHelper_1.hashPassword)(password);
                const userData = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: hashedPassword,
                };
                const user = yield userRepository_1.default.create(userData);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Users created successfully', user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Update User
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check Validation
                const { companyId } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Users',
                    permission: ['edit'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                // Update User
                const user = yield userServices_1.default.updateUser(req.body);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User updated successfully', user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Delete User
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { user, company } = req.body;
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, company, {
                    permissionName: 'Users',
                    permission: ['delete'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const adminEmails = yield userRepository_1.default.getAllAdminEmails(company);
                // const emails = await adminEmails.map((item) => item?.user?.email);
                const companyDetails = yield repositories_1.companyRepository.getDetails(company);
                const userDetails = yield userRepository_1.default.getById(user);
                let userName;
                if ((userDetails === null || userDetails === void 0 ? void 0 : userDetails.firstName) && (userDetails === null || userDetails === void 0 ? void 0 : userDetails.lastName)) {
                    userName = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.firstName) + ' ' + (userDetails === null || userDetails === void 0 ? void 0 : userDetails.lastName);
                }
                else {
                    userName = userDetails === null || userDetails === void 0 ? void 0 : userDetails.email;
                }
                const userEmailContent = (0, emailTemplateHelper_1.getUserEmailOnDeleteTemplate)({
                    userName,
                    companyName: companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName,
                });
                // Send email to the user who is deleted
                const deletedUserMailOptions = {
                    from: config_1.default.smtpEmail,
                    to: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email,
                    subject: `Your Access to ${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName} has been Revoked - CostAllocation Pro`,
                    html: userEmailContent,
                    // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                };
                yield (0, emailHelper_1.default)(deletedUserMailOptions);
                yield Promise.all(yield adminEmails.map((item) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f;
                    let adminUserName;
                    if (((_a = item === null || item === void 0 ? void 0 : item.user) === null || _a === void 0 ? void 0 : _a.firstName) && ((_b = item === null || item === void 0 ? void 0 : item.user) === null || _b === void 0 ? void 0 : _b.lastName)) {
                        adminUserName = ((_c = item === null || item === void 0 ? void 0 : item.user) === null || _c === void 0 ? void 0 : _c.firstName) + ' ' + ((_d = item === null || item === void 0 ? void 0 : item.user) === null || _d === void 0 ? void 0 : _d.lastName);
                    }
                    else {
                        adminUserName = (_e = item === null || item === void 0 ? void 0 : item.user) === null || _e === void 0 ? void 0 : _e.email;
                    }
                    const emailContent = (0, emailTemplateHelper_1.getAdminEmailOnUserDeleteTemplate)({
                        adminUserName,
                        userName,
                        companyName: companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName,
                        url: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl,
                    });
                    // Send the email to all the admins
                    const mailOptions = {
                        from: config_1.default.smtpEmail,
                        to: (_f = item === null || item === void 0 ? void 0 : item.user) === null || _f === void 0 ? void 0 : _f.email,
                        subject: `Access to ${companyDetails === null || companyDetails === void 0 ? void 0 : companyDetails.tenantName} has been Revoked - CostAllocation Pro`,
                        html: emailContent,
                        // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                    };
                    yield (0, emailHelper_1.default)(mailOptions);
                })));
                const deletedUser = yield userServices_1.default.deleteUser(user, company);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User deleted successfully', deletedUser);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Invite User
    inviteUser(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { email, role, company, phone, firstName = '', lastName = '', } = req.body;
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, company, {
                    permissionName: 'Users',
                    permission: ['add'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const user = yield userServices_1.default.inviteUser((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id, (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.email, email, role, company, phone, firstName, lastName);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'User invited successfully', user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    // Integrate User
    integrate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, validationHelper_1.checkValidation)(req);
                const { user, role, company } = req.body;
                const integratedUser = yield companyRoleRepository_1.default.create(user, role, company);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 201, 'User Integrated Successfully', integratedUser);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new UserController();
