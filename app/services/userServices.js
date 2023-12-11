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
/* eslint-disable no-mixed-spaces-and-tabs */
const config_1 = __importDefault(require("../../config"));
const emailHelper_1 = __importDefault(require("../helpers/emailHelper"));
const emailTemplateHelper_1 = require("../helpers/emailTemplateHelper");
const tokenHelper_1 = require("../helpers/tokenHelper");
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const companyRoleRepository_1 = __importDefault(require("../repositories/companyRoleRepository"));
const inviteRepository_1 = __importDefault(require("../repositories/inviteRepository"));
class UserServices {
    // Get all users
    getAllUsers(company, page, limit, search, filter, type, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Offset set
                const offset = (Number(page) - 1) * Number(limit);
                // Conditions for filtering
                const filterConditions = filter
                    ? { status: filter == 'true' ? true : false }
                    : {};
                // Conditions for search
                const searchCondition = search
                    ? {
                        OR: [
                            {
                                firstName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                            {
                                lastName: {
                                    mode: 'insensitive',
                                    contains: search,
                                },
                            },
                            {
                                email: { contains: search, mode: 'insensitive' },
                            },
                        ],
                    }
                    : {};
                // Conditions for sort
                const sortCondition = sort
                    ? {
                        orderBy: {
                            [sort]: type !== null && type !== void 0 ? type : 'asc',
                        },
                    }
                    : {};
                // Get all users
                const users = yield repositories_1.userRepository.getAll(company, offset, limit, filterConditions, searchCondition, sortCondition);
                // Get total user count
                const total = yield repositories_1.userRepository.count(company, filterConditions, searchCondition);
                return { users, total };
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get user by id
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield repositories_1.userRepository.getById(id);
                return user;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update user
    updateUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, companyId, roleId, status, isChangeStatus = false } = data, userData = __rest(data, ["userId", "companyId", "roleId", "status", "isChangeStatus"]);
                // Find User
                const user = yield repositories_1.userRepository.getById(userId);
                if (!user) {
                    const error = new customError_1.CustomError(400, 'User not found');
                    throw error;
                }
                // Find Company
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(400, 'Company not found');
                    throw error;
                }
                // Check if user exist in the company
                const userExist = yield companyRoleRepository_1.default.userExistInCompany(companyId, userId);
                if (!userExist) {
                    const error = new customError_1.CustomError(400, 'User does not exist in this company');
                    throw error;
                }
                if (isChangeStatus && roleId) {
                    const roleExist = yield repositories_1.roleRepository.getDetails(roleId);
                    if (!roleExist) {
                        const error = new customError_1.CustomError(400, 'Role does not exist');
                        throw error;
                    }
                    // Update User Role
                    if (status === true) {
                        const companyUsers = yield repositories_1.userRepository.checkAddUserLimit(companyId);
                        if (companyUsers.totalNoOfUser.length >= 11) {
                            throw new customError_1.CustomError(403, 'User limit is reached');
                        }
                        if (companyUsers.totalAdminUser.length >= 2 &&
                            roleExist.isAdminRole) {
                            throw new customError_1.CustomError(403, 'Admin user limit is reached');
                        }
                    }
                }
                let updatedUser;
                yield repositories_1.userRepository.update(userId, userData);
                if (status != null && roleId) {
                    updatedUser = yield companyRoleRepository_1.default.updateUserStatus(companyId, roleId, userId, status);
                }
                if (roleId && companyId) {
                    updatedUser = yield companyRoleRepository_1.default.updateUserRole(userId, companyId, roleId);
                }
                updatedUser = yield companyRoleRepository_1.default.get(userId, companyId, roleId);
                return updatedUser;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Invite user
    inviteUser(invitedBy, invitedByEmail, email, role, company, phone, firstName, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminUser = yield repositories_1.userRepository.getById(invitedBy);
                const finalName = adminUser.firstName + ' ' + adminUser.lastName;
                // Find user by Email
                const user = yield repositories_1.userRepository.getByEmail(email);
                // Check if role exists
                const roleExist = yield repositories_1.roleRepository.getDetails(role);
                if (!roleExist) {
                    const error = new customError_1.CustomError(404, 'Role does not exist');
                    throw error;
                }
                if (user) {
                    // Check if user already exist in the same company
                    const userExist = yield repositories_1.roleRepository.userExist(user === null || user === void 0 ? void 0 : user.id, company);
                    if (userExist.length > 0) {
                        const error = new customError_1.CustomError(404, 'User already exists in the same company');
                        throw error;
                    }
                    const invitedUser = yield companyRoleRepository_1.default.create(user === null || user === void 0 ? void 0 : user.id, role, company);
                    const companyName = yield repositories_1.companyRepository.getDetails(company);
                    // Mail send to the invited user
                    const emailContent = (0, emailTemplateHelper_1.getInvitationEmailUserExistTemplate)({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        companyName: companyName === null || companyName === void 0 ? void 0 : companyName.tenantName,
                        url: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl,
                    });
                    // Send mail to generate new password
                    const mailOptions = {
                        from: config_1.default.smtpEmail,
                        to: email,
                        subject: 'Invitation to join CostAllocation Pro portal',
                        html: emailContent,
                        // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                    };
                    // Mail send to admin
                    const adminEmailContent = (0, emailTemplateHelper_1.getInvitationAdminMailTemplate)({
                        finalName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        companyName: companyName === null || companyName === void 0 ? void 0 : companyName.tenantName,
                        url: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl,
                    });
                    // Send mail to Admin
                    const adminMailOptions = {
                        from: config_1.default.smtpEmail,
                        to: invitedByEmail,
                        subject: 'Invitation to join CostAllocation Pro portal',
                        html: adminEmailContent,
                        // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                    };
                    // Send email to user
                    yield (0, emailHelper_1.default)(mailOptions);
                    // Send email to admin
                    yield (0, emailHelper_1.default)(adminMailOptions);
                    return invitedUser;
                }
                else {
                    // Checking the no of the user
                    const companyUsers = yield repositories_1.userRepository.checkAddUserLimit(company);
                    if (companyUsers.totalNoOfUser.length >= 11) {
                        throw new customError_1.CustomError(403, 'User limit is reached');
                    }
                    if (companyUsers.totalAdminUser.length >= 2 && roleExist.isAdminRole) {
                        throw new customError_1.CustomError(403, 'Admin user limit is reached');
                    }
                    // Reset Password Token Generate
                    const resetPasswordToken = yield (0, tokenHelper_1.generateForgotPasswordToken)({
                        email: email,
                        role: role,
                    });
                    // Expires in 1 hour
                    const resetPasswordTokenExpiresAt = (Date.now() + (config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.registerUrlExpireTime)).toString();
                    // Create new user with forgot password token and verified false
                    const createdUser = yield repositories_1.userRepository.create({
                        email: email,
                        forgotPasswordToken: resetPasswordToken,
                        forgotPasswordTokenExpiresAt: resetPasswordTokenExpiresAt,
                        phone: phone,
                        firstName,
                        lastName,
                    });
                    // Check if role (first time created) already exists without user
                    let companyRole;
                    const isRoleExists = yield (companyRoleRepository_1.default === null || companyRoleRepository_1.default === void 0 ? void 0 : companyRoleRepository_1.default.checkCompanyRole(company, role));
                    if (isRoleExists) {
                        yield companyRoleRepository_1.default.updateUserCompanyRole(createdUser === null || createdUser === void 0 ? void 0 : createdUser.id, company, role);
                        companyRole = yield companyRoleRepository_1.default.get(createdUser === null || createdUser === void 0 ? void 0 : createdUser.id, company, role);
                    }
                    else {
                        // Create new company role with user, role and company
                        companyRole = yield companyRoleRepository_1.default.create(createdUser === null || createdUser === void 0 ? void 0 : createdUser.id, role, company);
                    }
                    // Create new invite
                    yield inviteRepository_1.default.create(invitedBy, createdUser === null || createdUser === void 0 ? void 0 : createdUser.id, role, company, companyRole === null || companyRole === void 0 ? void 0 : companyRole.id);
                    const companyName = yield repositories_1.companyRepository.getDetails(company);
                    // Verify token url
                    const url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl}/reset-password?token=${resetPasswordToken}&first=true`;
                    const emailContent = (0, emailTemplateHelper_1.getInvitationEmailUserTemplate)({
                        firstName: createdUser.firstName,
                        lastName: createdUser.lastName,
                        companyName: companyName === null || companyName === void 0 ? void 0 : companyName.tenantName,
                        url,
                    });
                    // Send mail to generate new password
                    const mailOptions = {
                        from: config_1.default.smtpEmail,
                        to: email,
                        subject: 'Invitation to join CostAllocation Pro company',
                        html: emailContent,
                        // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                    };
                    // Mail send to admin
                    const adminEmailContent = (0, emailTemplateHelper_1.getInvitationAdminMailTemplate)({
                        finalName,
                        firstName: createdUser === null || createdUser === void 0 ? void 0 : createdUser.firstName,
                        lastName: createdUser === null || createdUser === void 0 ? void 0 : createdUser.lastName,
                        companyName: companyName === null || companyName === void 0 ? void 0 : companyName.tenantName,
                        url: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl,
                    });
                    // Send mail to Admin
                    const adminMailOptions = {
                        from: config_1.default.smtpEmail,
                        to: invitedByEmail,
                        subject: 'Invitation to join CostAllocation Pro portal',
                        html: adminEmailContent,
                        // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                    };
                    yield (0, emailHelper_1.default)(mailOptions);
                    yield (0, emailHelper_1.default)(adminMailOptions);
                    return companyRole;
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Reinvite User
    reinviteUser(invitedBy, invitedByEmail, email, companyId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const adminUser = yield repositories_1.userRepository.getById(invitedBy);
            const finalName = adminUser.firstName + ' ' + adminUser.lastName;
            // Find user by id
            const user = yield repositories_1.userRepository.getById(userId);
            if (user && !user.isVerified) {
                // Reset Password Token Generate
                const resetPasswordToken = yield (0, tokenHelper_1.generateForgotPasswordToken)({
                    email: email,
                    role: role,
                });
                // Expires in 1 hour
                const resetPasswordTokenExpiresAt = (Date.now() + (config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.registerUrlExpireTime)).toString();
                // Update user's verification token
                const updatedUser = yield repositories_1.userRepository.update(user.id, {
                    forgotPasswordToken: resetPasswordToken,
                    forgotPasswordTokenExpiresAt: resetPasswordTokenExpiresAt,
                });
                const companyName = yield repositories_1.companyRepository.getDetails(companyId);
                // Verify token url
                const url = `${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl}/reset-password?token=${resetPasswordToken}&first=true`;
                const emailContent = (0, emailTemplateHelper_1.getInvitationEmailUserTemplate)({
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    companyName: companyName === null || companyName === void 0 ? void 0 : companyName.tenantName,
                    url,
                });
                // Send mail to generate new password
                const mailOptions = {
                    from: config_1.default.smtpEmail,
                    to: email,
                    subject: 'Invitation to join CostAllocation Pro company',
                    html: emailContent,
                    // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                };
                // Mail send to admin
                const adminEmailContent = (0, emailTemplateHelper_1.getInvitationAdminMailTemplate)({
                    finalName,
                    firstName: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.firstName,
                    lastName: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.lastName,
                    companyName: companyName === null || companyName === void 0 ? void 0 : companyName.tenantName,
                    url: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl,
                });
                // Send mail to Admin
                const adminMailOptions = {
                    from: config_1.default.smtpEmail,
                    to: invitedByEmail,
                    subject: 'Invitation to join CostAllocation Pro portal',
                    html: adminEmailContent,
                    // text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
                };
                yield (0, emailHelper_1.default)(mailOptions);
                yield (0, emailHelper_1.default)(adminMailOptions);
                return;
            }
            else {
                throw new customError_1.CustomError(400, 'User has already invited in this company');
            }
        });
    }
    // Delete User
    deleteUser(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find User
                const user = yield repositories_1.userRepository.getById(userId);
                if (!user) {
                    const error = new customError_1.CustomError(404, 'User not found');
                    throw error;
                }
                // Find Company
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                // Check if user exist in the company
                const userExist = yield companyRoleRepository_1.default.userExistInCompany(companyId, userId);
                if (!userExist) {
                    const error = new customError_1.CustomError(404, 'User does not exist in this company');
                    throw error;
                }
                // Delete User From Company Role
                const deleteUser = yield companyRoleRepository_1.default.deleteUserFromCompany(userId, companyId);
                return deleteUser;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new UserServices();
