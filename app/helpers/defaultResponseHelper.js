"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultResponse = void 0;
// Default Response For Every Api
const DefaultResponse = (res, statusCode, message, data, total, page) => {
    let response = {
        message: message,
        statusCode: statusCode,
        data: data,
    };
    if (total) {
        response = Object.assign(Object.assign({}, response), { total });
    }
    if (page) {
        response = Object.assign(Object.assign({}, response), { page });
    }
    return res.status(statusCode).json(response);
};
exports.DefaultResponse = DefaultResponse;
