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
exports.runMigration = void 0;
const prisma_1 = require("../client/prisma");
const migrations_1 = require("../constants/migrations");
const migration_service_1 = require("./migration.service");
function runMigration() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Migration started');
        for (let i = 0; i < migrations_1.migrations.length; i++) {
            let migrationId = '';
            const getMigration = yield prisma_1.prisma.migrations.findFirst({
                where: {
                    name: migrations_1.migrations[i]
                }
            });
            if (getMigration) {
                migrationId = getMigration.id;
            }
            try {
                if (!getMigration) {
                    console.log('Running Migration ', migrations_1.migrations[i]);
                    const createMigration = yield prisma_1.prisma.migrations.create({
                        data: {
                            name: migrations_1.migrations[i]
                        }
                    });
                    migrationId = createMigration.id;
                    yield migration_service_1.migrationService[migrations_1.migrations[i]]();
                    yield prisma_1.prisma.migrations.update({
                        where: {
                            id: migrationId
                        },
                        data: {
                            isCompleted: true
                        }
                    });
                }
            }
            catch (error) {
                console.log(error);
                yield prisma_1.prisma.migrations.update({
                    where: {
                        id: migrationId
                    },
                    data: {
                        isFailed: true
                    }
                });
            }
        }
        console.log('Migration completed');
    });
}
exports.runMigration = runMigration;
