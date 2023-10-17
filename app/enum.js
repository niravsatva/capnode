"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSheetsStatus = exports.PayPeriodStatus = exports.ResponseStatus = void 0;
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Success"] = 200] = "Success";
    ResponseStatus[ResponseStatus["Created"] = 201] = "Created";
    ResponseStatus[ResponseStatus["Error"] = 400] = "Error";
    ResponseStatus[ResponseStatus["Unauthorized"] = 401] = "Unauthorized";
    ResponseStatus[ResponseStatus["Forbidden"] = 403] = "Forbidden";
    ResponseStatus[ResponseStatus["NoContent"] = 204] = "NoContent";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
var PayPeriodStatus;
(function (PayPeriodStatus) {
    PayPeriodStatus[PayPeriodStatus["CURRENT"] = 1] = "CURRENT";
    PayPeriodStatus[PayPeriodStatus["POSTED"] = 2] = "POSTED";
})(PayPeriodStatus || (exports.PayPeriodStatus = PayPeriodStatus = {}));
var TimeSheetsStatus;
(function (TimeSheetsStatus) {
    TimeSheetsStatus["PUBLISHED"] = "Published";
    TimeSheetsStatus["DRAFT"] = "Draft";
})(TimeSheetsStatus || (exports.TimeSheetsStatus = TimeSheetsStatus = {}));
