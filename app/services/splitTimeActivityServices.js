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
const splitTimeActivityRepository_1 = __importDefault(require("../repositories/splitTimeActivityRepository"));
const timeActivityRepository_1 = __importDefault(require("../repositories/timeActivityRepository"));
class SplitTimeActivityServices {
    createSplitTimeActivity(parentActivityId, employeeId, splitTimeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Object: ', splitTimeActivityData);
            const parentTimeActivity = yield timeActivityRepository_1.default.getSingleTimeActivity(parentActivityId);
            if (!parentTimeActivity) {
                throw new customError_1.CustomError(404, 'Time activity not found');
            }
            if ((parentTimeActivity === null || parentTimeActivity === void 0 ? void 0 : parentTimeActivity.employeeId) !== employeeId) {
                throw new customError_1.CustomError(400, 'Employee id must be same');
            }
            // const splitTimeActivity =
            // 	await splitTimeActivityRepository.getSplitTimeActivityByParentId(
            // 		parentActivityId
            // 	);
            // if (splitTimeActivity.length > 0) {
            // 	throw new CustomError(400, 'Time activities are already splitted');
            // }
            const parentHours = parentTimeActivity === null || parentTimeActivity === void 0 ? void 0 : parentTimeActivity.hours;
            const parentMinutes = parentTimeActivity === null || parentTimeActivity === void 0 ? void 0 : parentTimeActivity.minute;
            const parentFinalTime = Number(parentHours) * 60 + Number(parentMinutes);
            let totalHours = 0;
            let totalMinutes = 0;
            splitTimeActivityData === null || splitTimeActivityData === void 0 ? void 0 : splitTimeActivityData.forEach((obj) => {
                totalHours += parseInt(obj.hours, 10);
                totalMinutes += parseInt(obj.minute, 10);
            });
            // If totalMinutes exceeds 59, adjust totalHours accordingly
            if (totalMinutes >= 60) {
                const additionalHours = Math.floor(totalMinutes / 60);
                totalHours += additionalHours;
                totalMinutes %= 60;
            }
            const splitFinalTime = Number(totalHours) * 60 + Number(totalMinutes);
            if (splitFinalTime !== parentFinalTime) {
                throw new customError_1.CustomError(400, 'Split time cannot be greater than the parent time.');
            }
            yield splitTimeActivityRepository_1.default.create(parentActivityId, employeeId, splitTimeActivityData);
            const finalData = yield splitTimeActivityRepository_1.default.getSplitTimeActivityByParentId(parentActivityId);
            return finalData;
        });
    }
    deleteSplitTimeActivity(splitTimeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { splitTimeActivityId } = splitTimeActivityData;
            const deletedSplitActivity = yield splitTimeActivityRepository_1.default.delete({
                splitTimeActivityId: splitTimeActivityId,
            });
            return deletedSplitActivity;
        });
    }
}
exports.default = new SplitTimeActivityServices();
