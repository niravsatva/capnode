"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = void 0;
const moment_1 = __importDefault(require("moment"));
const generatePdf = (pdfData, singleEmployee, customers) => {
    const { allTimeLogs, startDate, endDate, totalHours, totalMinutes } = pdfData;
    const { fullName } = singleEmployee;
    let htmlData = ``;
    allTimeLogs === null || allTimeLogs === void 0 ? void 0 : allTimeLogs.forEach((singleTimeLog) => {
        if ((singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.SplitTimeActivities) &&
            (singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.SplitTimeActivities.length) > 0) {
            singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.SplitTimeActivities.forEach((singleSplitTimeLog) => {
                htmlData += `<tr>
                    <td>${(0, moment_1.default)(singleSplitTimeLog === null || singleSplitTimeLog === void 0 ? void 0 : singleSplitTimeLog.activityDate).format('MM/DD/YYYY')}</td>
                      <td>${singleSplitTimeLog === null || singleSplitTimeLog === void 0 ? void 0 : singleSplitTimeLog.className}</td>
                      <td>${singleSplitTimeLog === null || singleSplitTimeLog === void 0 ? void 0 : singleSplitTimeLog.customerName}</td>
                      <td>${singleSplitTimeLog === null || singleSplitTimeLog === void 0 ? void 0 : singleSplitTimeLog.hours} : ${singleSplitTimeLog === null || singleSplitTimeLog === void 0 ? void 0 : singleSplitTimeLog.minute}</td>
                    </tr>`;
            });
        }
        else {
            htmlData += `<tr>
                    <td>${(0, moment_1.default)(singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.activityDate).format('MM/DD/YYYY')}</td>
                      <td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.className}</td>
                      <td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.customerName}</td>
                      <td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.hours} : ${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.minute}</td>
                    </tr>`;
        }
    });
    let customerData = ``;
    customers === null || customers === void 0 ? void 0 : customers.forEach((singleCustomer) => {
        customerData += `<tr>
                        <td>${singleCustomer === null || singleCustomer === void 0 ? void 0 : singleCustomer.customerName}</td>
                        <td>${singleCustomer === null || singleCustomer === void 0 ? void 0 : singleCustomer.hours}</td>
                        </td>
                      </tr>`;
    });
    return `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
        *{
            font-family: Arial, sans-serif;
        }
          table {
              width: 100%;
              border-collapse: collapse;
          }

          table, th, td {
              border: 1px solid black;
          }

          th, td {
              padding: 8px;
              text-align: left;
          }
          
      </style>
  </head>
  <body>
      <div style="margin: 0; padding: 0; box-sizing: border-box; font-family: Arial;"> 
				<div style="margin-bottom:20px;  ">
				<img src='https://costallocationspro.s3.amazonaws.com/cap-logonew.png' width="180px" style="float: left;"/>
				<p style="text-align: center; padding-top: 12px; padding-right:150px; font-weight:800">Time Sheet</p>
			</div>
      <br/> 
      <p>Employee Name: ${fullName}</p>
      <p>Pay Period: ${(0, moment_1.default)(startDate).format('MM/DD/YYYY')} - ${(0, moment_1.default)(endDate).format('MM/DD/YYYY')}</p>
      <p>Total Time: ${totalHours} Hours ${totalMinutes} Minutes</p>

      <table>
        <tr>
          <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Date</th>
          <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Class Name</th>
          <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Customer Name</th>
          <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Hours</th> 
        <tr>
        <tbody> 
          ${htmlData}
        </tbody>
      </table>
    
      <br/>
    
      <table> 
        <tr>
          <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Customer Name</th>
          <th style="background-color: #333; color: white; padding: 8px; text-align: left;">Hours</th>
        </tr> 
      <tbody> 
        ${customerData}
      </tbody>
      </table>
      <br/>
      <p> I certify that this is a correct representation of actual hours worked for the time period shown above.
         <table style="border-collapse: separate; border-spacing: 10px 5px; border: none;">
          <tr>
            <td style="padding: 5px; text-align: left; border: none;">Employee Signature :</td>
            <td style="padding: 5px; text-align: left; border: none;">Supervisor Signature :</td>
          </tr>
          <tr>
            <td style="padding: 5px; text-align: left; border: none;">Date: __________________</td>
            <td style="padding: 5px; text-align: left; border: none;">Date: __________________</td>
          </tr>
        </table> 
      </body>
  </html>
`;
};
exports.generatePdf = generatePdf;
