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
const data_1 = require("../constants/data");
class ConfigurationRepository {
    // Create default configuration settings for the first time company is created
    createDefaultConfiguration(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configuration = yield prisma_1.prisma.configuration.create({
                    data: {
                        settings: data_1.DefaultConfigurationSettings,
                        indirectExpenseRate: 10,
                        payrollMethod: 'Hours',
                        company: { connect: { id: companyId } },
                    },
                });
                return configuration;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Get company configurations
    getCompanyConfiguration(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configuration = yield prisma_1.prisma.configuration.findFirst({
                    where: {
                        companyId: companyId,
                    },
                });
                return configuration;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // Update configuration settings
    updateConfiguration(companyId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedConfiguration = yield prisma_1.prisma.configuration.update({
                    where: {
                        companyId: companyId,
                    },
                    data: data,
                });
                return updatedConfiguration;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = new ConfigurationRepository();
