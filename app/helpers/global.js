"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchConditionSQL = exports.formatNumberWithCommas = exports.employeeFormationDataHandler = void 0;
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
