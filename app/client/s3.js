"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Storage = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_s3_1 = __importDefault(require("multer-s3"));
const config_1 = __importDefault(require("../../config"));
exports.s3Client = new client_s3_1.S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: config_1.default.s3accessKeyId,
        secretAccessKey: config_1.default.s3secretAccessKey,
    },
});
exports.s3Storage = (0, multer_s3_1.default)({
    s3: exports.s3Client,
    bucket: `${process.env.S3_BUCKETNAME}`,
    metadata: (req, file, cb) => {
        cb(null, { fieldname: file.fieldname });
    },
    key: (req, file, cb) => {
        const fileName = Date.now() + '_' + file.fieldname + '_' + file.originalname;
        cb(null, fileName);
    },
});
