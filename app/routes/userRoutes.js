"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = express_1.default.Router();
// Get All Users
router.get('/', controllers_1.userController.getAllUsers);
// Get User Details By Id
router.get('/:id', controllers_1.userController.getUserDetails);
// Create New User (Temporary Api)
router.post('/', controllers_1.userController.createUser);
// Update User by Id
router.put('/', validators_1.updateUserByAdminValidation, controllers_1.userController.updateUser);
// Invite New User
router.post('/invite-user', validators_1.inviteUserValidationRules, controllers_1.userController.inviteUser);
// Delete User From Particular Company
router.delete('/', adminMiddleware_1.isAdminUser, validators_1.deleteUserFromCompanyRules, controllers_1.userController.deleteUser);
// Integrate user with company (Temporary Api)
router.post('/integrate', controllers_1.userController.integrate);
exports.default = router;
