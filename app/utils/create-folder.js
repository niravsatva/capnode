"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrCreateFolder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function checkOrCreateFolder() {
    const folderPath = path_1.default.join(__dirname, './app', 'costAllocationPdfs');
    fs_1.default.mkdirSync(folderPath);
}
exports.checkOrCreateFolder = checkOrCreateFolder;
