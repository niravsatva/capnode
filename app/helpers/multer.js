"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const s3_1 = require("../client/s3");
exports.updateProfileMiddleware = (0, multer_1.default)({ storage: s3_1.s3Storage });
