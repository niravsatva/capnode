"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.customError = void 0;
const customError_1 = require("../models/customError");
// Custom Error Object
const customError = (err, req, res, next) => {
    const error = new customError_1.CustomError(err.status, err.message, err.additionalInfo);
    if (error.status == 500) {
        return res.status(error.status).json({
            error: err,
            message: 'Something went wrong',
            responseStatus: error.status,
        });
    }
    else {
        return res.status(error.status).json({
            error: err,
            message: error.message,
            responseStatus: error.status,
        });
    }
};
exports.customError = customError;
// 404 Not Found Error
const notFound = (req, res, next) => {
    const error = new customError_1.CustomError(404, `Path not found`);
    next(error);
};
exports.notFound = notFound;
