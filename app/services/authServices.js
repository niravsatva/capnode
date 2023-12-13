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
const config_1 = __importDefault(require("../../config"));
const emailHelper_1 = __importDefault(require("../helpers/emailHelper"));
const emailTemplateHelper_1 = require("../helpers/emailTemplateHelper");
const passwordHelper_1 = require("../helpers/passwordHelper");
const tokenHelper_1 = require("../helpers/tokenHelper");
const customError_1 = require("../models/customError");
const tokenRepository_1 = __importDefault(require("../repositories/tokenRepository"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const repositories_1 = require("../repositories");
const prisma_1 = require("../client/prisma");
class AuthServices {
    login(email, password, machineId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user exists
                const user = yield userRepository_1.default.getByEmail(email);
                if (!user) {
                    const error = new customError_1.CustomError(401, 'Invalid credentials');
                    throw error;
                }
                // Check if user is verified
                if (!(user === null || user === void 0 ? void 0 : user.isVerified)) {
                    const error = new customError_1.CustomError(401, 'User is not verified');
                    throw error;
                }
                //   Validate Password
                const validPassword = yield (0, passwordHelper_1.comparePassword)(password, user.password);
                //   Password not valid
                if (!validPassword) {
                    const error = new customError_1.CustomError(401, 'Invalid credentials');
                    throw error;
                }
                const isValidForLogin = (_a = user === null || user === void 0 ? void 0 : user.companies) === null || _a === void 0 ? void 0 : _a.some((singleCompany) => {
                    var _a, _b;
                    const permissions = (_b = (_a = singleCompany === null || singleCompany === void 0 ? void 0 : singleCompany.role) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.filter((item) => (item === null || item === void 0 ? void 0 : item.all) === true ||
                        (item === null || item === void 0 ? void 0 : item.view) === true ||
                        (item === null || item === void 0 ? void 0 : item.edit) === true ||
                        (item === null || item === void 0 ? void 0 : item.delete) === true ||
                        (item === null || item === void 0 ? void 0 : item.add) === true);
                    if ((permissions === null || permissions === void 0 ? void 0 : permissions.length) === 0) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                const isValidForLoginWithRole = (_b = user === null || user === void 0 ? void 0 : user.companies) === null || _b === void 0 ? void 0 : _b.some((singleCompany) => {
                    var _a;
                    return (_a = singleCompany === null || singleCompany === void 0 ? void 0 : singleCompany.role) === null || _a === void 0 ? void 0 : _a.status;
                });
                const isValidSubscription = (_c = user === null || user === void 0 ? void 0 : user.companies) === null || _c === void 0 ? void 0 : _c.some((singleCompany) => {
                    var _a;
                    const subScription = (_a = singleCompany === null || singleCompany === void 0 ? void 0 : singleCompany.company) === null || _a === void 0 ? void 0 : _a.Subscription;
                    if (subScription && subScription.length) {
                        if (!subScription[0].status || subScription[0].status != 'live') {
                            return false;
                        }
                    }
                    return true;
                });
                const superAdminSubscription = yield prisma_1.prisma.subscription.findFirst({
                    where: {
                        userId: user.id,
                    },
                });
                console.log(superAdminSubscription);
                if (superAdminSubscription &&
                    (!superAdminSubscription.status ||
                        superAdminSubscription.status != 'live')) {
                    throw new customError_1.CustomError(400, 'You do not have any active subscription currently');
                }
                if (!isValidSubscription) {
                    throw new customError_1.CustomError(400, 'You do not have any active subscription currently');
                }
                if (!isValidForLogin) {
                    throw new customError_1.CustomError(401, 'You are not authorized to access the system please contact your administrator.');
                }
                if (!isValidForLoginWithRole) {
                    throw new customError_1.CustomError(401, 'You are not authorized to access the system please contact your administrator.');
                }
                //   Credentials Valid
                const accessToken = (0, tokenHelper_1.generateAccessToken)({ id: user === null || user === void 0 ? void 0 : user.id, email: email });
                const refreshToken = (0, tokenHelper_1.generateRefreshToken)({ id: user === null || user === void 0 ? void 0 : user.id, email: email });
                yield tokenRepository_1.default.create(user === null || user === void 0 ? void 0 : user.id, accessToken, refreshToken, machineId);
                return { accessToken, refreshToken, user };
            }
            catch (err) {
                throw err;
            }
        });
    }
    ssoLogin(user, machineId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const isValidForLogin = (_a = user === null || user === void 0 ? void 0 : user.companies) === null || _a === void 0 ? void 0 : _a.some((singleCompany) => {
                var _a, _b;
                const permissions = (_b = (_a = singleCompany === null || singleCompany === void 0 ? void 0 : singleCompany.role) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.filter((item) => (item === null || item === void 0 ? void 0 : item.all) === true ||
                    (item === null || item === void 0 ? void 0 : item.view) === true ||
                    (item === null || item === void 0 ? void 0 : item.edit) === true ||
                    (item === null || item === void 0 ? void 0 : item.delete) === true ||
                    (item === null || item === void 0 ? void 0 : item.add) === true);
                if ((permissions === null || permissions === void 0 ? void 0 : permissions.length) === 0) {
                    return false;
                }
                else {
                    return true;
                }
            });
            const isValidForLoginWithRole = (_b = user === null || user === void 0 ? void 0 : user.companies) === null || _b === void 0 ? void 0 : _b.some((singleCompany) => {
                var _a;
                return (_a = singleCompany === null || singleCompany === void 0 ? void 0 : singleCompany.role) === null || _a === void 0 ? void 0 : _a.status;
            });
            const isValidSubscription = (_c = user === null || user === void 0 ? void 0 : user.companies) === null || _c === void 0 ? void 0 : _c.some((singleCompany) => {
                var _a;
                const subScription = (_a = singleCompany === null || singleCompany === void 0 ? void 0 : singleCompany.company) === null || _a === void 0 ? void 0 : _a.Subscription;
                if (subScription && subScription.length) {
                    if (!subScription[0].status || subScription[0].status != 'live') {
                        return false;
                    }
                }
                return true;
            });
            const superAdminSubscription = yield prisma_1.prisma.subscription.findFirst({
                where: {
                    userId: user.id,
                },
            });
            if (superAdminSubscription &&
                (!superAdminSubscription.status ||
                    superAdminSubscription.status != 'live')) {
                throw new customError_1.CustomError(400, 'You do not have any active subscription currently');
            }
            if (!isValidSubscription) {
                throw new customError_1.CustomError(400, 'You do not have any active subscription currently');
            }
            if (!isValidForLogin) {
                throw new customError_1.CustomError(401, 'You are not authorized to access the system please contact your administrator.');
            }
            if (!isValidForLoginWithRole) {
                throw new customError_1.CustomError(401, 'You are not authorized to access the system please contact your administrator.');
            }
            //   Credentials Valid
            const accessToken = (0, tokenHelper_1.generateAccessToken)({
                id: user === null || user === void 0 ? void 0 : user.id,
                email: user.email,
            });
            const refreshToken = (0, tokenHelper_1.generateRefreshToken)({
                id: user === null || user === void 0 ? void 0 : user.id,
                email: user.email,
            });
            yield tokenRepository_1.default.create(user === null || user === void 0 ? void 0 : user.id, accessToken, refreshToken, machineId);
            return { accessToken, refreshToken, user };
        });
    }
    register(firstName, lastName, email, customerId, subscriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository_1.default.register(firstName, lastName, email, customerId);
                // Generate forgot password token
                const forgotPasswordToken = (0, tokenHelper_1.generateForgotPasswordToken)({
                    id: user === null || user === void 0 ? void 0 : user.id,
                    email: email,
                });
                // Expire time for token
                const forgotPasswordTokenExpiresAt = (Date.now() + config_1.default.registerUrlExpireTime).toString();
                // Store token in the database
                yield userRepository_1.default.update(user === null || user === void 0 ? void 0 : user.id, {
                    forgotPasswordToken: forgotPasswordToken,
                    forgotPasswordTokenExpiresAt: forgotPasswordTokenExpiresAt,
                });
                const userSubscription = {
                    zohoSubscriptionId: subscriptionData.subscription_id,
                    zohoProductId: subscriptionData.product_id,
                    zohoSubscriptionPlan: subscriptionData.plan,
                    createdTime: subscriptionData.created_time,
                    status: subscriptionData.status,
                    addons: subscriptionData.addons,
                    expiresAt: subscriptionData.expires_at,
                    zohoCustomerId: subscriptionData.customer.customer_id,
                    userId: user.id,
                };
                yield repositories_1.subscriptionRepository.createSubscription(userSubscription);
                // Change Password url
                const url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.changePasswordReactUrl}?token=${forgotPasswordToken}&first=true`;
                // const url = `${config?.reactAppBaseUrl}/change-password?token=${forgotPasswordToken}`;
                const fullName = firstName || lastName ? firstName + ' ' + lastName : 'User';
                const emailContent = (0, emailTemplateHelper_1.getRegisterEmailTemplate)({ fullName, url });
                const mailOptions = {
                    from: config_1.default.smtpEmail,
                    to: email,
                    subject: 'Welcome to CostAllocation Pro!',
                    html: emailContent,
                };
                yield (0, emailHelper_1.default)(mailOptions);
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository_1.default.getByEmail(email);
                if (!user) {
                    return;
                    const error = new customError_1.CustomError(400, 'Please check your inbox. If you have account with us you got email with reset instruction.');
                    throw error;
                }
                // Generate forgot password token
                const forgotPasswordToken = yield (0, tokenHelper_1.generateForgotPasswordToken)({
                    id: user === null || user === void 0 ? void 0 : user.id,
                    email: email,
                });
                // Expires in 1 hour
                const forgotPasswordTokenExpiresAt = (Date.now() + config_1.default.forgotPasswordUrlExpireTime).toString();
                // Store token in the database
                yield userRepository_1.default.update(user === null || user === void 0 ? void 0 : user.id, {
                    forgotPasswordToken: forgotPasswordToken,
                    forgotPasswordTokenExpiresAt: forgotPasswordTokenExpiresAt,
                });
                const fullName = (user === null || user === void 0 ? void 0 : user.firstName) || (user === null || user === void 0 ? void 0 : user.lastName)
                    ? (user === null || user === void 0 ? void 0 : user.firstName) + ' ' + (user === null || user === void 0 ? void 0 : user.lastName)
                    : 'User';
                // Verify token url
                const url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.resetPasswordReactUrl}?token=${forgotPasswordToken}&exp=${forgotPasswordTokenExpiresAt}`;
                // const url = `${config?.reactAppBaseUrl}/reset-password?token=${forgotPasswordToken}&exp=${forgotPasswordTokenExpiresAt}`;
                const emailContent = (0, emailTemplateHelper_1.getForgotPasswordTemplate)({
                    fullName,
                    url,
                });
                // Send the email with the reset token
                const mailOptions = {
                    from: config_1.default.smtpEmail,
                    to: email,
                    subject: 'Reset Password - CostAllocation Pro',
                    html: emailContent,
                    // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                };
                yield (0, emailHelper_1.default)(mailOptions);
                return;
            }
            catch (err) {
                throw err;
            }
        });
    }
    verifyForgotPassword(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // If token not exists, send error message
                if (!token) {
                    const err = new customError_1.CustomError(401, 'Token missing');
                    throw err;
                }
                const verified = (0, tokenHelper_1.verifyForgotPasswordToken)(token);
                // If token not valid, send error message
                if (!verified) {
                    const err = new customError_1.CustomError(401, 'Invalid token');
                    throw err;
                }
                // Find user by email from verified token
                const user = yield userRepository_1.default.getByEmail(verified === null || verified === void 0 ? void 0 : verified.email);
                // If user not exists, send error message
                if (!user) {
                    const err = new customError_1.CustomError(401, 'Invalid token');
                    throw err;
                }
                // If forgotPasswordToken not exists in db, send error message
                if (user.forgotPasswordToken !== token) {
                    const err = new customError_1.CustomError(401, 'Reset token has expired');
                    throw err;
                }
                // If token is expired, send error message
                if (Number(user.forgotPasswordTokenExpiresAt) < Date.now()) {
                    const err = new customError_1.CustomError(401, 'Reset token has expired');
                    throw err;
                }
                // Everything is valid, proceed further
                return true;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // async changePassword(email: string, password: string) {
    // 	try {
    // 		// Find user by email
    // 		const user = await userRepository.getByEmail(email);
    // 		// User not found
    // 		if (!user) {
    // 			const error = new CustomError(404, 'User not found');
    // 			throw error;
    // 		}
    // 		// Encrypt password
    // 		const hashedPassword = await hashPassword(password);
    // 		// Save password and remove forgot password tokens
    // 		const updatedUser = await userRepository.update(user?.id, {
    // 			password: hashedPassword,
    // 			forgotPasswordToken: null,
    // 			forgotPasswordTokenExpiresAt: null,
    // 		});
    // 		return updatedUser;
    // 	} catch (err) {
    // 		throw err;
    // 	}
    // }
    changePassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // If token not exists, send error message
                if (!token) {
                    const err = new customError_1.CustomError(401, 'Token missing');
                    throw err;
                }
                const verified = yield (0, tokenHelper_1.verifyForgotPasswordToken)(token);
                // If token not valid, send error message
                if (!verified) {
                    const err = new customError_1.CustomError(401, 'Invalid token');
                    throw err;
                }
                // Find user by email from verified token
                const user = yield userRepository_1.default.getByEmail(verified === null || verified === void 0 ? void 0 : verified.email);
                // If user not exists, send error message
                if (!user) {
                    const err = new customError_1.CustomError(401, 'Invalid token');
                    throw err;
                }
                // If forgotPasswordToken not exists in db, send error message
                if (user.forgotPasswordToken !== token) {
                    const err = new customError_1.CustomError(401, 'Reset token has expired');
                    throw err;
                }
                // If token is expired, send error message
                if (Number(user.forgotPasswordTokenExpiresAt) < Date.now()) {
                    const err = new customError_1.CustomError(401, 'Reset token has expired');
                    throw err;
                }
                // Check if the new password is the same as the old one
                if (user === null || user === void 0 ? void 0 : user.password) {
                    const encrypted = yield (0, passwordHelper_1.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password);
                    if (encrypted) {
                        const error = new customError_1.CustomError(422, 'New password cannot be same as old password');
                        throw error;
                    }
                }
                // Encrypt password
                const hashedPassword = yield (0, passwordHelper_1.hashPassword)(password);
                // Save password and remove forgot password tokens
                const updatedUser = yield userRepository_1.default.update(user === null || user === void 0 ? void 0 : user.id, {
                    password: hashedPassword,
                    isVerified: true,
                    forgotPasswordToken: null,
                    forgotPasswordTokenExpiresAt: null,
                });
                return updatedUser;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new AuthServices();
