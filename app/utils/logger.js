"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const colors_1 = __importDefault(require("colors"));
colors_1.default.setTheme({
    info: 'green',
    warn: 'yellow',
    error: 'red',
    debug: 'blue'
});
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), // Apply colorization to log messages
    winston_1.default.format.simple()),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_daily_rotate_file_1.default({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }) // Log to a daily rotating file
    ]
});
