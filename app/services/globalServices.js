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
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
class GlobalService {
    generatePdf(pdfData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bodyHtml, footerHtml, headerHtml } = pdfData;
            const browser = yield puppeteer_1.default.launch({
                headless: false,
                args: [
                    '--disable-gpu',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--ignore-certificate-errors',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins',
                    '--disable-site-isolation-trials'
                ],
                executablePath: ''
            });
            const page = yield browser.newPage();
            const htmlString = bodyHtml;
            yield page.setContent(htmlString);
            // Generate the PDF as a buffer
            const pdfBuffer = yield page.pdf({
                format: 'A4',
                displayHeaderFooter: true,
                headerTemplate: headerHtml,
                footerTemplate: footerHtml,
            });
            fs_1.default.writeFileSync('output.pdf', pdfBuffer);
            // Convert the buffer to a base64 string
            const pdfBase64 = pdfBuffer.toString('base64');
            // Log or return the base64-encoded PDF
            console.log(pdfBase64);
            yield browser.close();
            return pdfBase64;
        });
    }
}
exports.default = new GlobalService();
