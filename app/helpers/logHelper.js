"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLog = exports.InfoLog = void 0;
const log4js_1 = __importDefault(require("log4js"));
log4js_1.default.configure({
    appenders: {
        gcl: {
            type: 'file',
            filename: `logs/DailyLogs_${new Date().toJSON().slice(0, 10)}.log`,
        },
    },
    categories: { default: { appenders: ['gcl'], level: 'error' } },
});
const logger = log4js_1.default.getLogger();
logger.level = 'debug';
// Information Log
const InfoLog = (api, data) => {
    logger.info(`[${api}] - `, data);
};
exports.InfoLog = InfoLog;
// Error Log
const ErrorLog = (api, data) => {
    logger.error(`[${api}] - `, data);
};
exports.ErrorLog = ErrorLog;
