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
const prisma_1 = require("../client/prisma");
const customError_1 = require("../models/customError");
class CostAllocationService {
    getCostAllocationData(payPeriodId) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSheetData = yield prisma_1.prisma.timeSheets.findUnique({
                where: {
                    payPeriodId
                }
            });
            if (!timeSheetData) {
                throw new customError_1.CustomError(400, 'Invalid Pay Period');
            }
            const data = yield prisma_1.prisma.employee.findMany({
                where: {
                    timeActivities: {
                        some: {
                            timeSheetId: timeSheetData.id,
                        }
                    }
                },
                select: {
                    fullName: true,
                    id: true,
                    timeActivities: {
                        where: {
                            timeSheetId: timeSheetData.id
                        }
                    },
                    employeeCostField: {
                        include: {
                            field: true,
                            costValue: {
                                where: {
                                    payPeriodId: payPeriodId,
                                    isPercentage: true,
                                }
                            },
                        },
                    }
                }
            });
            return data;
        });
    }
}
exports.default = new CostAllocationService();
