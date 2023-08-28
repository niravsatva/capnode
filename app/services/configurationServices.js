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
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const configurationRepository_1 = __importDefault(require("../repositories/configurationRepository"));
// import employeeServices from './employeeServices';
class ConfigurationService {
    // For get sections with fields
    getFieldsSection(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sections = yield configurationRepository_1.default.getConfigurationField(companyId);
                console.log('Sections: ', sections);
                return sections;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For create field with section
    createField(companyId, sectionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = yield repositories_1.companyRepository.getDetails(companyId);
                if (!company) {
                    const error = new customError_1.CustomError(404, 'Company not found');
                    throw error;
                }
                const createdField = yield configurationRepository_1.default.createField(companyId, sectionId, data);
                // Get all employees by companyId
                const employeeList = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
                console.log('Employee list: ', employeeList);
                // Employee Cost Field
                const listOfMonths = yield repositories_1.employeeCostRepository.getMonthsByCompanyId(companyId);
                yield repositories_1.employeeCostRepository.createNewEmployeeCost(employeeList, createdField === null || createdField === void 0 ? void 0 : createdField.id, companyId, listOfMonths);
                return createdField;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For delete field
    deleteField(fieldId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const deletedField =
                yield configurationRepository_1.default.deleteConfigurationField(fieldId, companyId);
                // Get all employee list
                const employees = yield repositories_1.employeeRepository.getAllEmployeesByCompanyId(companyId);
                // return deletedField;
                return employees;
            }
            catch (error) {
                throw error;
            }
        });
    }
    // For update field with section
    updateField(fieldId, fieldName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const editedField = yield configurationRepository_1.default.editConfigurationField(fieldId, fieldName);
                return editedField;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = new ConfigurationService();
