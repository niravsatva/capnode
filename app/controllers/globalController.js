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
const globalServices_1 = __importDefault(require("../services/globalServices"));
const logger_1 = require("../utils/logger");
// import { DefaultResponse } from '../helpers/defaultResponseHelper';
class GlobalController {
    pdfGenerator(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bodyHtml, headerHtml, footerHtml } = req.body;
                // const headerHtml = `
                //                     <div style="text-align: left; font-size: 12px;">
                //                       Company Name
                //                     </div>
                //                     <div style="text-align: center; font-size: 16px;">
                //                       Time Sheet
                //                     </div>
                //                   `;
                // const bodyHtml = `<!DOCTYPE html>
                //                     <html>
                //                       <h1>Body</h1>
                //                     </html>`;
                // const footerHtml = `
                //                     <div style="text-align: center;">
                //                       <h1>Footer</h1>
                //                     </div>
                //                   `;
                const data = {
                    bodyHtml: bodyHtml,
                    headerHtml: headerHtml,
                    footerHtml: footerHtml,
                };
                const pdf = yield globalServices_1.default.generatePdf(data);
                return res.end(pdf);
            }
            catch (err) {
                logger_1.logger.error('Error while making pdf ', err);
                next(err);
            }
        });
    }
}
exports.default = new GlobalController();
