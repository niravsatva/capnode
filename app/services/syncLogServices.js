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
const moment_1 = __importDefault(require("moment"));
const customError_1 = require("../models/customError");
const repositories_1 = require("../repositories");
const syncLogRepository_1 = __importDefault(require("../repositories/syncLogRepository"));
class SyncLogService {
    getSyncLogs(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { companyId, page = 1, limit = 10, filter, fromDate, toDate } = query;
            console.log('Filter: ', filter);
            if (!companyId) {
                throw new customError_1.CustomError(400, 'Company id is required');
            }
            const companyDetails = yield repositories_1.companyRepository.getDetails(companyId);
            if (!companyDetails) {
                throw new customError_1.CustomError(400, 'Company not found');
            }
            const offset = (Number(page) - 1) * Number(limit);
            // Conditions for filtering
            const filterConditions = filter
                ? { moduleName: filter }
                : {};
            let dateFilter = {};
            if (fromDate && toDate) {
                const startDate = (0, moment_1.default)(fromDate).startOf('day').toISOString();
                const endDate = (0, moment_1.default)(toDate).endOf('day').toISOString();
                dateFilter = {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                };
            }
            else {
                dateFilter = {
                    createdAt: {
                        gte: (0, moment_1.default)(new Date())
                            .add(-3, 'months')
                            .startOf('day')
                            .toISOString(),
                        lte: (0, moment_1.default)(new Date()).endOf('day').toISOString(),
                    },
                };
            }
            const { logs, count } = yield syncLogRepository_1.default.getAllLogs(companyId, offset, Number(limit), filterConditions, dateFilter);
            const data = logs.map((singleLog) => {
                return {
                    id: singleLog === null || singleLog === void 0 ? void 0 : singleLog.id,
                    date: (0, moment_1.default)(singleLog.createdAt).format('MM/DD/YYYY'),
                    time: (0, moment_1.default)(singleLog.createdAt).format('hh:mm A'),
                    module: singleLog === null || singleLog === void 0 ? void 0 : singleLog.moduleName,
                    status: singleLog === null || singleLog === void 0 ? void 0 : singleLog.status,
                    message: singleLog === null || singleLog === void 0 ? void 0 : singleLog.message,
                };
            });
            return { data, count };
        });
    }
}
exports.default = new SyncLogService();
