"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// require('dotenv').config();
const body_parser_1 = __importDefault(require("body-parser"));
// import pgSession from 'connect-pg-simple';
// import cookieParser from 'cookie-parser';
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
// import session from 'express-session';
// import { Pool } from 'pg';
const routes_1 = __importDefault(require("./app/routes"));
// Database configuration
require("./app/config/db");
const config_1 = __importDefault(require("./config"));
const migration_runner_service_1 = require("./app/services/migration-runner.service");
const logger_1 = require("./app/utils/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
(0, migration_runner_service_1.runMigration)();
// Import routes
app.use(`/${config_1.default.routeBasePath}`, routes_1.default);
const PORT = config_1.default.port || 8080;
//create pdf folder
const folderPath = path_1.default.join(__dirname, './app', 'costAllocationPdfs');
if (!fs_1.default.existsSync(folderPath) || !fs_1.default.statSync(folderPath).isDirectory()) {
    fs_1.default.mkdirSync(folderPath, { recursive: true });
    logger_1.logger.info(`Folder '${path_1.default}' created.`);
}
// Server configuration
app.listen(PORT, () => {
    logger_1.logger.info('Server is listening on port ' + PORT);
});
