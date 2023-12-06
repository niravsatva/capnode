"use strict";
// import { TimeSheetsStatus } from '../enum';
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRuleValidation = exports.chartOfAccountsValidation = exports.journalValidator = exports.timeSheetExportValidators = exports.timeSheetEmailValidators = exports.payPeriodValidator = exports.createTimeSheetValidator = exports.deleteAllSplitTimeActivity = exports.deleteSplitTimeActivity = exports.createSplitTimeActivity = exports.employeeCostUpdateValidation = exports.employeeCostCreateValidation = exports.deleteConfigurationFieldValidation = exports.updateConfigurationFieldValidation = exports.addConfigurationFieldValidation = exports.deleteTimeActivityValidation = exports.createTimeActivityValidation = exports.updateTimeActivityValidation = exports.timeActivityValidation = exports.employeeValidation = exports.companyConfigurationValidation = exports.companyGetConfigurationValidation = exports.quickbooksTimeActivityValidation = exports.quickbooksAccountsValidation = exports.quickbooksCustomersValidation = exports.quickbooksClassValidation = exports.quickbooksEmployeeValidation = exports.updateUserByAdminValidation = exports.permissionRoleValidationRules = exports.deleteRoleValidationRules = exports.updateRoleValidationRules = exports.createRoleValidationRules = exports.companyIdValidationRules = exports.updateProfileValidationRules = exports.deleteUserFromCompanyRules = exports.reinviteUserValidationRules = exports.inviteUserValidationRules = exports.changePasswordValidationRules = exports.forgotPasswordValidationRules = exports.loginValidationRules = exports.companyIdValidation = void 0;
const express_validator_1 = require("express-validator");
const data_1 = require("../constants/data");
/* eslint-disable @typescript-eslint/no-var-requires */
// CompanyId Validation
exports.companyIdValidation = [
    (0, express_validator_1.body)('companyId')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company id'),
];
// Login validation rules
exports.loginValidationRules = [
    // Validate email
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
    // Validate password
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
// Forgot Password validation rules
exports.forgotPasswordValidationRules = [
    // Validate email
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
];
// Change Password validation rules
exports.changePasswordValidationRules = [
    // Validate password
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        .withMessage('Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 8 characters long'),
    // Validate confirmPassword
    (0, express_validator_1.body)('confirmPassword')
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
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('role')
        .notEmpty()
        .withMessage('Role id is required')
        .isUUID()
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('company')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
// Reinvite User validation rules
exports.reinviteUserValidationRules = [
    (0, express_validator_1.body)('userId')
        .notEmpty()
        .withMessage('User id is required')
        .isUUID()
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('role')
        .notEmpty()
        .withMessage('Role id is required')
        .isUUID()
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('companyId')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
// Delete User from Company
exports.deleteUserFromCompanyRules = [
    (0, express_validator_1.body)('user')
        .notEmpty()
        .withMessage('User id is required')
        .isUUID()
        .withMessage('Invalid User'),
    (0, express_validator_1.body)('company')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid Company'),
];
// Update profile validation rules
exports.updateProfileValidationRules = [
    (0, express_validator_1.body)('firstName')
        .optional()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(/^\d{10}$/)
        .withMessage('Invalid phone number format'),
];
// for roles
exports.companyIdValidationRules = [
    (0, express_validator_1.body)('orgId').notEmpty().withMessage('Please select the organization'),
];
exports.createRoleValidationRules = [
    ...exports.companyIdValidationRules,
    (0, express_validator_1.body)('roleName').notEmpty().withMessage('Please enter the role name'),
    (0, express_validator_1.body)('roleDescription')
        .notEmpty()
        .withMessage('Please enter the role description'),
];
exports.updateRoleValidationRules = [
    ...exports.companyIdValidationRules,
    (0, express_validator_1.body)('roleId').notEmpty().withMessage('Please enter the role id'),
    (0, express_validator_1.body)('roleName').optional(),
    (0, express_validator_1.body)('roleDescription').optional(),
];
exports.deleteRoleValidationRules = [
    ...exports.companyIdValidationRules,
    (0, express_validator_1.body)('roleId').notEmpty().withMessage('Please enter the role id'),
];
exports.permissionRoleValidationRules = [
    ...exports.companyIdValidationRules,
    (0, express_validator_1.body)('roleId').notEmpty().withMessage('Please enter the role id'),
    (0, express_validator_1.body)('permissions').notEmpty().withMessage('Please enter the permissions'),
];
// Update User By Admin
exports.updateUserByAdminValidation = [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User id is required'),
    (0, express_validator_1.body)('companyId').notEmpty().withMessage('Company id is required'),
];
exports.quickbooksEmployeeValidation = [
    (0, express_validator_1.body)('companyId')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
exports.quickbooksClassValidation = [
    (0, express_validator_1.body)('companyId')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
exports.quickbooksCustomersValidation = [
    (0, express_validator_1.body)('companyId')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
exports.quickbooksAccountsValidation = [
    (0, express_validator_1.body)('companyId')
        .notEmpty()
        .withMessage('Company id is required')
        .isUUID()
        .withMessage('Invalid company'),
];
exports.quickbooksTimeActivityValidation = [...exports.companyIdValidation];
const payrollMethods = ['Hours', 'Percentage'];
exports.companyGetConfigurationValidation = [...exports.companyIdValidation];
exports.companyConfigurationValidation = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('indirectExpenseRate')
        .notEmpty()
        .withMessage('Expense Rate is required'),
    (0, express_validator_1.body)('payrollMethod')
        .notEmpty()
        .withMessage('Payroll Method is required')
        .isIn(payrollMethods)
        .withMessage('Payroll Method is not valid'),
    (0, express_validator_1.body)('settings').notEmpty().withMessage('Settings field is required'),
    // .isArray()
    // .withMessage('Data must be a non-empty array'),
];
// Employee Validation
exports.employeeValidation = [...exports.companyIdValidation];
// Time Activities
exports.timeActivityValidation = [...exports.companyIdValidation];
// Update time activity
exports.updateTimeActivityValidation = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('timeActivityId').notEmpty().withMessage('Time Activity id is required'),
    (0, express_validator_1.body)('hours').notEmpty().withMessage('Hours is required'),
    (0, express_validator_1.body)('minute').notEmpty().withMessage('Minute is required'),
];
// Create time activity
exports.createTimeActivityValidation = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('hours').notEmpty().withMessage('Hours is required'),
    (0, express_validator_1.body)('minute').notEmpty().withMessage('Minute is required'),
    (0, express_validator_1.body)('activityDate').notEmpty().withMessage('Activity Date is required'),
];
// Delete time activity
exports.deleteTimeActivityValidation = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('timeActivityId').notEmpty().withMessage('Time Activity id is required'),
];
exports.addConfigurationFieldValidation = [
    (0, express_validator_1.body)('companyId').notEmpty().withMessage('Company id is required'),
    (0, express_validator_1.body)('sectionId').notEmpty().withMessage('section id is required'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Field name is required'),
    (0, express_validator_1.body)('jsonId').notEmpty().withMessage('Json id is required'),
];
exports.updateConfigurationFieldValidation = [
    (0, express_validator_1.body)('fieldId').notEmpty().withMessage('Field id is required'),
    (0, express_validator_1.body)('fieldName').notEmpty().withMessage('Field name is required'),
];
exports.deleteConfigurationFieldValidation = [
    (0, express_validator_1.body)('companyId').notEmpty().withMessage('Company id is required'),
    (0, express_validator_1.body)('fieldId').notEmpty().withMessage('Field id is required'),
];
exports.employeeCostCreateValidation = [
    (0, express_validator_1.body)('companyId').notEmpty().withMessage('CompanyId is required'),
    (0, express_validator_1.body)('date').notEmpty().withMessage('Date is required'),
];
exports.employeeCostUpdateValidation = [
    (0, express_validator_1.body)('employeeCostValueID')
        .notEmpty()
        .withMessage('Employee costID is required'),
    (0, express_validator_1.body)('value').notEmpty().withMessage('value is required'),
];
exports.createSplitTimeActivity = [
    (0, express_validator_1.body)('parentActivityId')
        .notEmpty()
        .withMessage('Parent activity id is required'),
    (0, express_validator_1.body)('employeeId').notEmpty().withMessage('Employee id is required'),
    (0, express_validator_1.body)('timeActivityData.*.classId')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
    (0, express_validator_1.body)('timeActivityData.*.customerId')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
    (0, express_validator_1.body)('timeActivityData.*.className')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
    (0, express_validator_1.body)('timeActivityData.*.customerName')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
    (0, express_validator_1.body)('timeActivityData.*.hours')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
    (0, express_validator_1.body)('timeActivityData.*.minute')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
    (0, express_validator_1.body)('timeActivityData.*.activityDate')
        .not()
        .isEmpty()
        .withMessage('Time activity data is not valid'),
];
exports.deleteSplitTimeActivity = [
    (0, express_validator_1.body)('splitTimeActivityId')
        .notEmpty()
        .withMessage('Split time activity id is required'),
];
exports.deleteAllSplitTimeActivity = [
    (0, express_validator_1.body)('timeActivityId').notEmpty().withMessage('Time activity id is required'),
];
exports.createTimeSheetValidator = [
    ...exports.companyIdValidation,
    // body('name').notEmpty().withMessage('Time sheet name is required'),
    // body('status').notEmpty().withMessage('Time sheet status is required'),
    // body('status')
    // 	.isIn(TimeSheetsStatus)
    // 	.withMessage('Time sheet status is invalid'),
    // body('notes').notEmpty().withMessage('Time sheet notes required'),
    (0, express_validator_1.body)('payPeriodId').notEmpty().withMessage('Pay period id is required'),
];
exports.payPeriodValidator = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('startDate').notEmpty().withMessage('Start date is required'),
    (0, express_validator_1.body)('endDate').notEmpty().withMessage('End date is required'),
];
exports.timeSheetEmailValidators = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('timeSheetId').notEmpty().withMessage('Time sheet id is required'),
    (0, express_validator_1.body)('employeeList')
        .isArray()
        .withMessage('Employee list field must be an array')
        .custom((value) => value.length > 0)
        .withMessage('Employee list array must not be empty'),
];
exports.timeSheetExportValidators = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('timeSheetId').notEmpty().withMessage('Time sheet id is required'),
    (0, express_validator_1.body)('employeeId').notEmpty().withMessage('Employee id is required'),
];
exports.journalValidator = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('payPeriodId').notEmpty().withMessage('Pay Period is required'),
    (0, express_validator_1.body)('date').notEmpty().withMessage('Journal Date is required'),
    (0, express_validator_1.body)('qboJournalNo').notEmpty().withMessage('Journal number is required'),
    (0, express_validator_1.body)('status').notEmpty().withMessage('Status is required'),
];
exports.chartOfAccountsValidation = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('accountName').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('accountType').custom((value) => {
        if (value) {
            if (!data_1.supportedAccountTypes.includes(value)) {
                throw new Error('Value must be one of the allowed values');
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('currencyValue').custom((value) => {
        if (value) {
            if (!data_1.currencyValues.includes(value)) {
                throw new Error('Value must be one of the allowed values');
            }
        }
        return true;
    }),
];
//custom rule validation
exports.customRuleValidation = [
    ...exports.companyIdValidation,
    (0, express_validator_1.body)('name').notEmpty().withMessage('Rule name is required'),
    (0, express_validator_1.body)('isActive').notEmpty().isBoolean().withMessage('Status is required'),
    (0, express_validator_1.body)('triggerProcess').notEmpty().isIn(['split', 'add', 'edit', 'delete']).withMessage('Trigger process with any of split, add, edit or delete choices is acceptable'),
    (0, express_validator_1.body)('criteria.employeeId').notEmpty().withMessage('Criteria with employeeId is required'),
    (0, express_validator_1.body)('actions').notEmpty().isArray().withMessage('Actions is required')
];
