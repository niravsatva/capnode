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
const repositories_1 = require("../repositories");
const customError_1 = require("../models/customError");
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
const validationHelper_1 = require("../helpers/validationHelper");
const splitTimeActivityServices_1 = __importDefault(require("../services/splitTimeActivityServices"));
const timeActivityRepository_1 = __importDefault(require("../repositories/timeActivityRepository"));
class SplitTimeActivityController {
    getAllSplitTimeActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, parentActivityId } = req.query;
                if (!companyId) {
                    throw new customError_1.CustomError(404, 'Company id is required');
                }
                if (!parentActivityId) {
                    throw new customError_1.CustomError(404, 'Parent time activity id is required');
                }
                const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
                if (!companyDetails) {
                    throw new customError_1.CustomError(404, 'Company not found');
                }
                const data = {
                    companyId: companyId,
                    parentActivityId: parentActivityId,
                };
                const timeActivityDetails = yield timeActivityRepository_1.default.getTimeActivityDetails(data);
                if (!timeActivityDetails) {
                    throw new customError_1.CustomError(404, 'Time activity not found');
                }
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Time activity fetched successfully', timeActivityDetails);
            }
            catch (err) {
                next(err);
            }
        });
    }
    createSplitTimeActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { parentActivityId, employeeId, timeActivityData } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                if (timeActivityData.length === 0) {
                    throw new customError_1.CustomError(400, 'Time activity data array must not be empty');
                }
                const splitActivities = yield splitTimeActivityServices_1.default.createSplitTimeActivity(parentActivityId, employeeId, timeActivityData);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Split activity created successfully', splitActivities);
            }
            catch (err) {
                next(err);
            }
        });
    }
    deleteSplitTimeActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { splitTimeActivityId } = req.body;
                (0, validationHelper_1.checkValidation)(req);
                const deletedActivity = yield splitTimeActivityServices_1.default.deleteSplitTimeActivity({
                    splitTimeActivityId: splitTimeActivityId,
                });
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Split activity deleted successfully', deletedActivity);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new SplitTimeActivityController();
