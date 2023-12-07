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
exports.generatePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const payPeriodRepository_1 = __importDefault(require("../repositories/payPeriodRepository"));
const global_1 = require("../helpers/global");
function mapJSONDataToArray(jsonData) {
    const headers = Object.keys(jsonData[0]);
    const dataArray = [headers];
    for (const obj of jsonData) {
        const values = headers.map((key) => obj[key]);
        dataArray.push(values);
    }
    return dataArray;
}
const generatePdf = (costAllocationData, counts, filePath, payPeriodId, companyName) => __awaiter(void 0, void 0, void 0, function* () {
    const classArr = [
        ...new Set(costAllocationData.map((item) => item['Class Name'])),
    ];
    const customerArr = [
        ...new Set(costAllocationData.map((item) => item['Customer Name'])),
    ];
    let classLength = 0;
    let customerLength = 0;
    classArr.forEach((item) => {
        if (item && item.length && item.length > classLength) {
            classLength = item.length;
        }
    });
    customerArr.forEach((item) => {
        if (item && item.length && item.length > customerLength) {
            customerLength = item.length;
        }
    });
    let finalWidth = classLength * 5;
    if (customerLength > classLength) {
        finalWidth = customerLength * 5;
    }
    const { salaryExpenseAccounts, fringeExpense, payrollTaxesExpense } = counts;
    const tableData = mapJSONDataToArray(costAllocationData);
    const salaryExpenseAccountsCounts = 5 + salaryExpenseAccounts;
    const payrollTaxesExpenseCounts = salaryExpenseAccountsCounts + payrollTaxesExpense;
    const fringeExpenseCounts = payrollTaxesExpenseCounts + fringeExpense;
    const doc = new pdfkit_1.default({
        size: [tableData[0].length * finalWidth + 100, tableData.length * 80 + 200],
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
    const titleText = 'Report Name : Cost Allocations';
    const titleOptions = {
        width: 500,
        fontSize: 40,
        color: 'black',
    };
    const titleY = imageY + 60;
    doc.text(titleText, imageX, titleY, titleOptions);
    // Date
    const { startDate, endDate } = yield payPeriodRepository_1.default.getDatesByPayPeriod(payPeriodId);
    const dateX = imageX;
    const dateY = titleY + 40;
    const date = `Pay Period : ${(0, global_1.getFormattedDates)(startDate, endDate)}`;
    doc.text(date, dateX, dateY, titleOptions);
    // Company Details
    const companyTitle = `Company Name : ${companyName}`;
    const companyY = dateY + 40;
    doc.text(companyTitle, imageX, companyY, titleOptions);
    // Table
    const cellWidth = finalWidth;
    // const cellWidth = 150;
    const cellHeight = 74;
    const borderWidth = 1;
    function drawTable(table, x, y) {
        for (let i = 0; i < table.length; i++) {
            const row = table[i];
            for (let j = 0; j < row.length; j++) {
                // Set the cell background color
                if (i === 0) {
                    // If it's the first row (header row), change the background color
                    doc.fillColor('#485949'); // Change the color as needed
                }
                else {
                    if (j < 3) {
                        doc.fillColor('#ffffff');
                    }
                    else if (j >= 3 && j <= 4) {
                        doc.fillColor('#FCF9E1');
                    }
                    else if (j >= 5 && j < salaryExpenseAccountsCounts) {
                        doc.fillColor('#E7EFF8');
                    }
                    else if (j >= salaryExpenseAccountsCounts &&
                        j < payrollTaxesExpenseCounts) {
                        doc.fillColor('#E1F1EB');
                    }
                    else if (j >= payrollTaxesExpenseCounts &&
                        j < fringeExpenseCounts) {
                        doc.fillColor('#F3EDE7');
                    }
                    else {
                        doc.fillColor('#DFE9ED');
                    }
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
exports.generatePdf = generatePdf;
