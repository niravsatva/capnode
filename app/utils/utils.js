"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXml = exports.hasText = exports.isBlank = exports.sortArray = exports.getSkipRecordCount = void 0;
const xml2js = __importStar(require("xml2js"));
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
function parseXml(xmlString) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlString, { explicitArray: false, explicitRoot: false }, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
exports.parseXml = parseXml;
