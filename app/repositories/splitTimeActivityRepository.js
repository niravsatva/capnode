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
class SplitTimeActivityRepository {
    create(parentActivityId, employeeId, splitTimeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.prisma.splitTimeActivities.deleteMany({
                where: {
                    timeActivityId: parentActivityId,
                },
            });
            const createdSplitTimeActivities = yield Promise.all(yield splitTimeActivityData.map((singleActivity) => __awaiter(this, void 0, void 0, function* () {
                // Check if existing split time activity available or not
                yield prisma_1.prisma.splitTimeActivities.create({
                    data: {
                        classId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.classId,
                        className: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.className,
                        customerId: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.customerId,
                        customerName: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.customerName,
                        hours: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.hours,
                        minute: singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.minute,
                        timeActivity: { connect: { id: parentActivityId } },
                        employee: { connect: { id: employeeId } },
                        activityDate: new Date(singleActivity === null || singleActivity === void 0 ? void 0 : singleActivity.activityDate),
                    },
                });
            })));
            return createdSplitTimeActivities;
        });
    }
    getSplitTimeActivityByParentId(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const splitTimeActivity = yield prisma_1.prisma.splitTimeActivities.findMany({
                    where: {
                        timeActivityId: parentId,
                    },
                });
                return splitTimeActivity;
            }
            catch (err) {
                throw err;
            }
        });
    }
    delete(splitTimeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { splitTimeActivityId } = splitTimeActivityData;
            const deletedSplitActivity = yield prisma_1.prisma.splitTimeActivities.delete({
                where: {
                    id: splitTimeActivityId,
                },
            });
            return deletedSplitActivity;
        });
    }
    deleteSplitActivity(splitTimeActivityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { timeActivityId } = splitTimeActivityData;
            yield prisma_1.prisma.splitTimeActivities.deleteMany({
                where: {
                    timeActivityId: timeActivityId,
                },
            });
        });
    }
}
exports.default = new SplitTimeActivityRepository();
