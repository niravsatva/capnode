"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsConfig = void 0;
const config_1 = __importDefault(require("../../config"));
exports.awsConfig = {
    region: 'us-east-1',
    credentials: {
        accessKeyId: config_1.default.s3accessKeyId,
        secretAccessKey: config_1.default.s3secretAccessKey,
    },
};
