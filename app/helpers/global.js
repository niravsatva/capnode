"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedDates = exports.getTotalMinutes = exports.minutesToHoursAndMinutes = exports.getSearchConditionSQL = exports.formatNumberWithCommas = exports.employeeFormationDataHandler = void 0;
const moment_1 = __importDefault(require("moment"));
/* eslint-disable no-prototype-builtins */
const employeeFormationDataHandler = (singleEmployeeData) => {
    const obj = {};
    obj['employeeName'] = singleEmployeeData.fullName;
    obj['totalLaborBurden'] = '0.00';
    for (const singleFieldObj of singleEmployeeData.employeeCostField) {
        obj[singleFieldObj.field.id] = singleFieldObj.costValue[0].value;
        obj[`value_${singleFieldObj.field.id}`] = singleFieldObj.costValue[0].id;
        obj[`section_${singleFieldObj.field.id}`] =
            singleFieldObj.field.configurationSectionId;
    }
    return obj;
};
exports.employeeFormationDataHandler = employeeFormationDataHandler;
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
exports.formatNumberWithCommas = formatNumberWithCommas;
function getSearchConditionSQL(searchCondition) {
    const conditions = [];
    // Loop through the key-value pairs in searchCondition
    for (const key in searchCondition) {
        if (searchCondition.hasOwnProperty(key)) {
            // Assuming the key represents a column name in your database
            // You may need to sanitize and validate the key to prevent SQL injection
            // Assuming the value is what you want to search for
            // You may need to sanitize and validate the value as well
            // Construct the SQL condition and push it to the conditions array
            conditions.push(`"${key}" = '${searchCondition[key]}'`);
        }
    }
    // Join the conditions with 'AND' and return as a single SQL condition
    return conditions.join(' AND ');
}
exports.getSearchConditionSQL = getSearchConditionSQL;
function minutesToHoursAndMinutes(minutes) {
    if (isNaN(minutes)) {
        return 'Invalid input';
    }
    const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
    const remainingMinutes = (minutes % 60).toString().padStart(2, '0');
    if (hours == '00') {
        return `00:${remainingMinutes}`;
    }
    else if (remainingMinutes == '00') {
        return `${hours}:00`;
    }
    else {
        return `${hours}:${remainingMinutes}`;
    }
}
exports.minutesToHoursAndMinutes = minutesToHoursAndMinutes;
function getTotalMinutes(hours, minutes) {
    let totalMinutes = 0;
    if (hours) {
        totalMinutes = Number(hours) * 60 + Number(minutes);
    }
    else {
        totalMinutes = Number(minutes);
    }
    return totalMinutes;
}
exports.getTotalMinutes = getTotalMinutes;
function getFormattedDates(startDate, endDate) {
    return `${(0, moment_1.default)(startDate).format('MM/DD/YYYY')} - ${(0, moment_1.default)(endDate).format('MM/DD/YYYY')}`;
}
exports.getFormattedDates = getFormattedDates;
