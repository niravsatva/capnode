"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Database Connection
prisma
    .$connect()
    .then(() => {
    logger_1.logger.info('Database connected successfully');
})
    .catch((error) => {
    logger_1.logger.info('Database connection error:', error);
});
