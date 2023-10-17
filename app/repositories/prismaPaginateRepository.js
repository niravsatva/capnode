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
exports.getPaginationData = void 0;
const utils_1 = require("../utils/utils");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getPaginationData(schema, searchEntity, pagination, otherParameters) {
    return __awaiter(this, void 0, void 0, function* () {
        let mainEntity = {
            search: Object.assign({}, searchEntity)
        };
        if (otherParameters) {
            mainEntity = Object.assign({ search: Object.assign({}, searchEntity) }, otherParameters);
        }
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const skip = (0, utils_1.getSkipRecordCount)(page, limit);
        const orderBy = [
            {
                id: 'desc'
            }
        ];
        if (pagination.type && pagination.sort) {
            orderBy.push({
                [pagination.type]: pagination.sort,
            });
        }
        const data = yield prisma[schema].findMany(Object.assign(Object.assign({}, mainEntity), { orderBy,
            skip }));
        const count = yield prisma[schema].count({
            where: Object.assign({}, searchEntity)
        });
        return {
            content: data,
            count: count
        };
    });
}
exports.getPaginationData = getPaginationData;
