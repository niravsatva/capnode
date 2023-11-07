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
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeLogPdfGenerate = void 0;
const timeLogPdfGenerate = (allTimeLogs) => __awaiter(void 0, void 0, void 0, function* () {
    return `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
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
      <p>Employee Name: "Ayush"</p>
      <p>Month: "February"</p>
      <p>Total Hours: 156</p>

      <table>
          <thead>
              <tr>
                  <th>Date</th>
                  <th>Employee Name</th>
                  <th>Customer Name</th>
                  <th>Class Name</th>
                  <th>Hours</th>
              </tr>
          </thead>
          <tbody> 
          ${allTimeLogs === null || allTimeLogs === void 0 ? void 0 : allTimeLogs.map((singleTimeLog) => {
        var _a;
        return `<tr>
									<td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.activityDate}</td>
									<td>${(_a = singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.employee) === null || _a === void 0 ? void 0 : _a.fullName}</td>
									<td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.className}</td>
									<td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.customerName}</td>
									<td>${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.hours}:${singleTimeLog === null || singleTimeLog === void 0 ? void 0 : singleTimeLog.minute}</td>
								</tr>`;
    })}
          </tbody>
      </table>
  </body>
  </html>


  `;
});
exports.timeLogPdfGenerate = timeLogPdfGenerate;
