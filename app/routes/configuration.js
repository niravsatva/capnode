"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const validators_1 = require("../helpers/validators");
const configuration = express_1.default.Router();
// For get the field by sections
configuration.get('/', controllers_1.configurationController.getFieldsSection);
// For create the field
configuration.post('/', validators_1.addConfigurationFieldValidation, controllers_1.configurationController.createField);
// For update the field
configuration.put('/', validators_1.updateConfigurationFieldValidation, controllers_1.configurationController.updateField);
// For delete the field
configuration.delete('/', validators_1.deleteConfigurationFieldValidation, controllers_1.configurationController.deleteField);
exports.default = configuration;
