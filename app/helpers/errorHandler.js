"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.customError = void 0;
const customError_1 = require("../models/customError");
const logger_1 = require("../utils/logger");
// Custom Error Object
const customError = (err, req, res, next) => {
    var _a;
    const error = new customError_1.CustomError(err.status, err.message, err.additionalInfo);
    logger_1.logger.error(`Error while solving Request Method: ${req.method} Url: ${req.originalUrl} of UserId: ${(_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id} failed with status code: ${error.status} message: ${error.message} Error: ${err}`, err);
    return res.status(error.status).json({
        error: err,
        message: error.status == 500 ? 'Something went wrong' : error.message,
        responseStatus: error.status,
    });
};
exports.customError = customError;
// 404 Not Found Error
const notFound = (req, res, next) => {
    const error = new customError_1.CustomError(404, `Path not found`);
    next(error);
};
exports.notFound = notFound;
