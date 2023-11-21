"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasText = exports.isBlank = exports.sortArray = exports.getSkipRecordCount = void 0;
function getSkipRecordCount(pageNo, pageSize) {
    return (Math.max(1, Number(pageNo)) - 1) * Math.min(100, Number(pageSize));
}
exports.getSkipRecordCount = getSkipRecordCount;
function sortArray(arr, type, field) {
    if (type === 'asc') {
        return arr.sort((a, b) => a[field].localeCompare(b[field]));
    }
    else {
        return arr.sort((a, b) => b[field].localeCompare(a[field]));
    }
}
exports.sortArray = sortArray;
function isBlank(value) {
    return (null === value ||
        undefined === value ||
        value.toString().trim().length === 0);
}
exports.isBlank = isBlank;
function hasText(value) {
    return !isBlank(value);
}
exports.hasText = hasText;
