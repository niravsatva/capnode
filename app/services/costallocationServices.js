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
const prisma_1 = require("../client/prisma");
const costAllocationRepository_1 = __importDefault(require("../repositories/costAllocationRepository"));
class CostAllocationServices {
    getCostAllocationData(costAllocationData) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheetData = yield prisma_1.prisma.timeSheets.findUnique({
                where: {
                    payPeriodId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.payPeriodId,
                },
            });
            if (!timeSheetData) {
                return { result: [], employeeRowSpanMapping: {} };
            }
            const offset = (Number(costAllocationData.page) - 1) * Number(costAllocationData.limit);
            const filteredData = [];
            const empFilteredData = [];
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId) {
                filteredData.push({ classId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.classId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId) {
                filteredData.push({ customerId: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.customerId });
            }
            if (costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId) {
                empFilteredData.push({
                    id: costAllocationData === null || costAllocationData === void 0 ? void 0 : costAllocationData.employeeId,
                });
            }
            const empFilterConditions = (empFilteredData === null || empFilteredData === void 0 ? void 0 : empFilteredData.length) > 0
                ? {
                    AND: empFilteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const filterConditions = (filteredData === null || filteredData === void 0 ? void 0 : filteredData.length) > 0
                ? {
                    AND: filteredData,
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            const searchCondition = costAllocationData.search
                ? {
                    OR: [
                        {
                            fullName: {
                                mode: 'insensitive',
                                contains: costAllocationData.search,
                            },
                        },
                    ],
                    // eslint-disable-next-line no-mixed-spaces-and-tabs
                }
                : {};
            // Conditions for sort
            const sortCondition = {
                orderBy: [
                    {
                        id: costAllocationData.type ? costAllocationData.type : 'asc',
                    },
                ],
            };
            if (costAllocationData.sort) {
                sortCondition.orderBy.push({
                    [costAllocationData.sort]: (_a = costAllocationData.type) !== null && _a !== void 0 ? _a : 'asc',
                });
            }
            costAllocationData.timeSheetId = String(timeSheetData.id);
            const costAllocationRepofilter = {
                companyId: costAllocationData.companyId,
                offset: offset,
                type: costAllocationData.type,
                limit: Number(costAllocationData.limit),
                searchCondition,
                sortCondition,
                filterConditions,
                empFilterConditions,
                classId: String(costAllocationData.classId),
                customerId: String(costAllocationData.customerId),
                employeeId: String(costAllocationData.employeeId),
                isPercentage: costAllocationData.isPercentage,
                payPeriodId: costAllocationData.payPeriodId,
            };
            const data = costAllocationRepository_1.default.getCostAllocation(costAllocationRepofilter);
            return data;
        });
    }
}
exports.default = new CostAllocationServices();
