"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError {
    constructor(status = 500, message = 'Something went wrong', additionalInfo = {}) {
        this.status = status;
        this.message = message;
        this.additionalInfo = additionalInfo;
    }
}
exports.CustomError = CustomError;
