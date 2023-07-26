"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidation = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
const { validationResult } = require('express-validator');
// Check Validation For Requests
const checkValidation = (req) => {
    const errors = validationResult(req);
    console.log('errors: ', errors);
    if (!errors.isEmpty()) {
        const validationError = {
            status: 400,
            //   status: 422,
            message: errors.errors[0].msg,
        };
        throw validationError;
    }
};
exports.checkValidation = checkValidation;
