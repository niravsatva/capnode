"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    logger_1.logger.info(`Request received at ${new Date()}  Method: ${req.method} Url: ${req.originalUrl}`);
    res.on('finish', () => {
        var _a;
        const duration = Date.now() - start;
        logger_1.logger.info(`Request of UserId: ${(_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id} Method: ${req.method} Url: ${req.originalUrl} completed in ${duration}ms with status code: ${res.statusCode}`);
    });
    next();
};
exports.requestLogger = requestLogger;
