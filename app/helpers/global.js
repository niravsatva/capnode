"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumberWithCommas = exports.employeeFormationDataHandler = void 0;
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
