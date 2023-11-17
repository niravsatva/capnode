"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const syncLogServices_1 = __importDefault(require("../services/syncLogServices"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
class SyncLogController {
    getSyncLogs(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId, page = 1, limit = 10 } = req.query;
                const data = yield syncLogServices_1.default.getSyncLogs(companyId, Number(page), Number(limit));
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, 'Sync logs fetched successfully', data);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.default = new SyncLogController();
