"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserByAdminValidation = exports.permissionRoleValidationRules = exports.deleteRoleValidationRules = exports.updateRoleValidationRules = exports.createRoleValidationRules = exports.companyIdValidationRules = exports.updateProfileValidationRules = exports.deleteUserFromCompanyRules = exports.inviteUserValidationRules = exports.changePasswordValidationRules = exports.forgotPasswordValidationRules = exports.loginValidationRules = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
const { body } = require('express-validator');
// Login validation rules
exports.loginValidationRules = [
    // Validate email
    body('email').isEmail().withMessage('Invalid email address'),
    // Validate password
    body('password').notEmpty().withMessage('Password is required'),
];
// Forgot Password validation rules
exports.forgotPasswordValidationRules = [
    // Validate email
    body('email').isEmail().withMessage('Invalid email address'),
];
// Change Password validation rules
exports.changePasswordValidationRules = [
    // Validate password
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        .withMessage('Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 8 characters long'),
    // Validate confirmPassword
    body('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password required')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
];
// Invite User validation rules
exports.inviteUserValidationRules = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('role')
        .notEmpty()
        .withMessage('Role id is required')
        .isUUID()
        .withMessage('Invalid role'),
    body('company')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
// Delete User from Company
exports.deleteUserFromCompanyRules = [
    body('user')
        .notEmpty()
        .withMessage('User id is required')
        .isUUID()
        .withMessage('Invalid User'),
    body('company')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid Company'),
];
// Update profile validation rules
exports.updateProfileValidationRules = [
    body('firstName')
        .optional()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters'),
    body('lastName')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters'),
    body('phone')
        .optional()
        .matches(/^\d{10}$/)
        .withMessage('Invalid phone number format'),
];
// for roles
exports.companyIdValidationRules = [
    body('orgId').notEmpty().withMessage('Please select the organization'),
];
exports.createRoleValidationRules = [
    ...exports.companyIdValidationRules,
    body('roleName').notEmpty().withMessage('Please enter the role name'),
    body('roleDescription')
        .notEmpty()
        .withMessage('Please enter the role description'),
];
exports.updateRoleValidationRules = [
    ...exports.companyIdValidationRules,
    body('roleId').notEmpty().withMessage('Please enter the role id'),
    body('roleName').optional(),
    body('roleDescription').optional(),
];
exports.deleteRoleValidationRules = [
    ...exports.companyIdValidationRules,
    body('roleId').notEmpty().withMessage('Please enter the role id'),
];
exports.permissionRoleValidationRules = [
    ...exports.companyIdValidationRules,
    body('roleId').notEmpty().withMessage('Please enter the role id'),
    body('permissions').notEmpty().withMessage('Please enter the permissions'),
];
// Update User By Admin
exports.updateUserByAdminValidation = [
    body('userId').notEmpty().withMessage('User id is required'),
    body('companyId').notEmpty().withMessage('Company id is required'),
];
