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
const validationHelper_1 = require("../helpers/validationHelper");
const customError_1 = require("../models/customError");
const employeeCostServices_1 = __importDefault(require("../services/employeeCostServices"));
const isAuthorizedUser_1 = require("../middlewares/isAuthorizedUser");
const dataExporter = require('json2csv').Parser;
class EmployeeConstController {
    // For get the cost by month
    getMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, date, page = 1, limit = 10, search, type, sort, } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!date) {
                    throw new customError_1.CustomError(400, 'Date is required');
                }
                // Checking is the user is permitted
                const isPermitted = yield (0, isAuthorizedUser_1.checkPermission)(req, companyId, {
                    permissionName: 'Employee Cost',
                    permission: ['view'],
                });
                if (!isPermitted) {
                    throw new customError_1.CustomError(403, 'You are not authorized');
                }
                const employeesMonthlyCost = yield employeeCostServices_1.default.getMonthlyCost(companyId, date, Number(page), Number(limit), search, type, sort);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', employeesMonthlyCost);
            }
            catch (error) {
                next(error);
            }
        });
    }
    // For create the cost my month
    createMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, date } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!date) {
                    throw new customError_1.CustomError(400, 'Date is required');
                }
                yield employeeCostServices_1.default.createMonthlyCost(companyId, date);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configuration values created successfully');
            }
            catch (error) {
                next(error);
            }
        });
    }
    //For update any single cost
    updateMonthlyCost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeCostValueID, value, selectedMonth, isCalculatorValue } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                if (!employeeCostValueID) {
                    throw new customError_1.CustomError(400, 'Employee Cost value id is required');
                }
                if (!value) {
                    throw new customError_1.CustomError(400, 'Value is required');
                }
                const updatedEmployeeCostValue = yield employeeCostServices_1.default.updateMonthlyCost(employeeCostValueID, value, selectedMonth, isCalculatorValue);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Configurations fetched successfully', updatedEmployeeCostValue);
            }
            catch (error) {
                next(error);
            }
        });
    }
    exportEmployeeCost(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, date, search, type, sort, isPercentage } = req.query;
                const percentage = isPercentage === 'false' ? false : true;
                if (!companyId) {
                    throw new customError_1.CustomError(400, 'Company id is required');
                }
                if (!date) {
                    throw new customError_1.CustomError(400, 'Date is required');
                }
                const employeesMonthlyCost = yield employeeCostServices_1.default.getMonthlyCostExport(companyId, date, search, type, sort, Boolean(percentage));
                const finalDataArr = (_a = employeesMonthlyCost === null || employeesMonthlyCost === void 0 ? void 0 : employeesMonthlyCost.employees) === null || _a === void 0 ? void 0 : _a.map((singleEmployee) => {
                    var _a;
                    const sortedData = (_a = singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.employeeCostField) === null || _a === void 0 ? void 0 : _a.sort((a, b) => {
                        // First, sort by field.configurationSection.no
                        if (a.field.configurationSection.no !==
                            b.field.configurationSection.no) {
                            return (a.field.configurationSection.no -
                                b.field.configurationSection.no);
                        }
                        else {
                            // If configurationSection.no values are equal, sort by field.jsonId
                            if (a.field.jsonId < b.field.jsonId) {
                                return -1;
                            }
                            else if (a.field.jsonId > b.field.jsonId) {
                                return 1;
                            }
                            else {
                                return 0;
                            }
                        }
                    });
                    let finalObject = {};
                    sortedData.forEach((item) => {
                        var _a, _b;
                        finalObject = Object.assign(Object.assign({}, finalObject), { [(_a = item === null || item === void 0 ? void 0 : item.field) === null || _a === void 0 ? void 0 : _a.name]: (_b = item === null || item === void 0 ? void 0 : item.costValue[0]) === null || _b === void 0 ? void 0 : _b.value });
                    });
                    return Object.assign(Object.assign({ 'Employee Name': singleEmployee === null || singleEmployee === void 0 ? void 0 : singleEmployee.fullName }, finalObject), { 'Total Labor Burden': Number(finalObject['Total Salary']) +
                            Number(finalObject['Total Fringe']) +
                            Number(finalObject['Total Payroll Taxes']) });
                });
                console.log('My percentage: ', percentage);
                if (percentage) {
                    finalDataArr.forEach((singleEmployee) => {
                        delete singleEmployee['Employee Type'];
                        delete singleEmployee['Maximum allocate hours per year'];
                        delete singleEmployee['Maximum Vacation/PTO hours per year'];
                    });
                }
                console.log('My final array : ', finalDataArr);
                const fileHeader = ['Employee Name', 'Employee Type'];
                const jsonData = new dataExporter({ fileHeader });
                const csvData = jsonData.parse(finalDataArr);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=employee_cost_data.csv');
                return res.status(200).end(csvData);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new EmployeeConstController();
