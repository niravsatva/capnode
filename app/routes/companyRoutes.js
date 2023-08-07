"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const router = express_1.default.Router();
router.get('/configuration', validators_1.companyGetConfigurationValidation, controllers_1.configurationController.getCompanyConfiguration);
router.get('/', controllers_1.companyController.getUserWiseCompanies);
router.get('/:id', controllers_1.companyController.getCompanyDetails);
router.post('/', controllers_1.companyController.createCompany);
router.put('/configuration', validators_1.companyConfigurationValidation, controllers_1.configurationController.updateCompanyConfiguration);
exports.default = router;
