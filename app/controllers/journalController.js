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
const journalServices_1 = __importDefault(require("../services/journalServices"));
const defaultResponseHelper_1 = require("../helpers/defaultResponseHelper");
class JournalController {
    getJournalEntries(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield journalServices_1.default.getJournalEntriesByPayPeriod(req.query);
                return (0, defaultResponseHelper_1.DefaultResponse)(res, 200, '', data);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new JournalController();
