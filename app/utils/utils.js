"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkipRecordCount = void 0;
function getSkipRecordCount(pageNo, pageSize) {
    return (Math.max(1, Number(pageNo)) - 1) * Math.min(100, Number(pageSize));
}
exports.getSkipRecordCount = getSkipRecordCount;
