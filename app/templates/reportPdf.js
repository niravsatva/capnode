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
exports.generateReportPdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
function mapJSONDataToArray(jsonData) {
    const headers = ['Name', ...jsonData.classNames, 'Total Hours'];
    const dataArray = [headers];
    for (const obj of jsonData.timeActivitySummary) {
        const values = [];
        values.push(obj.name);
        jsonData.classNames.forEach((e) => {
            if (obj[e]) {
                values.push(obj[e]);
            }
            else {
                values.push('');
            }
        });
        values.push(obj.totalHours);
        dataArray.push(values);
    }
    return dataArray;
}
const generateReportPdf = (costAllocationData, filePath, companyName) => __awaiter(void 0, void 0, void 0, function* () {
    const tableData = mapJSONDataToArray(costAllocationData);
    const doc = new pdfkit_1.default({
        size: [(costAllocationData.classNames.length + 2) * 180, 3000],
    });
    // doc.pipe(stream);
    // Image
    const image = 'https://costallocationspro.s3.amazonaws.com/cap-logonew.png';
    const imageX = 50;
    const imageY = 50;
    const imageWidth = 200;
    const response = yield axios_1.default.get(image, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    doc.image(imageBuffer, imageX, imageY, {
        width: imageWidth,
        height: 40,
    });
    // Title
    const titleText = 'Report Name : Time Summary Report';
    const titleOptions = {
        width: 500,
        fontSize: 32,
        color: 'black',
    };
    const titleY = imageY + 60;
    doc.text(titleText, imageX, titleY, titleOptions);
    // Company Details
    const companyTitle = `Company Name : ${companyName}`;
    const companyY = titleY + 50;
    doc.text(companyTitle, imageX, companyY, titleOptions);
    // Table
    const cellWidth = 150;
    const cellHeight = 74;
    const borderWidth = 1;
    function drawTable(table, x, y) {
        for (let i = 0; i < table.length; i++) {
            const row = table[i];
            for (let j = 0; j < row.length; j++) {
                if (i === 0) {
                    doc.fillColor('#485949');
                }
                else {
                    doc.fillColor('#F3EDE7');
                }
                doc.fontSize(16);
                // Fill the cell background
                doc
                    .rect(x + j * cellWidth, y + i * cellHeight, cellWidth, cellHeight)
                    .fill();
                // Set the text color
                if (i === 0) {
                    // If it's the first row (header row), change the background color
                    doc.fillColor('#FFFFFF'); // Change the color as needed
                }
                else {
                    doc.fillColor('#000000'); // Default background color for other rows
                }
                // Calculate vertical position for text to center it within the cell
                const textHeight = doc.heightOfString(row[j], {
                    width: cellWidth - 2 * borderWidth,
                    align: 'center',
                });
                const textY = y + i * cellHeight + (cellHeight - textHeight) / 2;
                // Draw the cell content
                doc.text(row[j], x + j * cellWidth + borderWidth, textY, {
                    width: cellWidth - 2 * borderWidth,
                    align: 'center',
                });
                // Draw cell borders
                doc
                    .rect(x + j * cellWidth, y + i * cellHeight, cellWidth, cellHeight)
                    .stroke();
            }
        }
    }
    const tableX = 50;
    const tableY = companyY + 40;
    drawTable(tableData, tableX, tableY);
    const stream = fs_1.default.createWriteStream(filePath);
    doc.pipe(stream);
    doc.end();
    return stream;
});
exports.generateReportPdf = generateReportPdf;
