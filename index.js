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
const express_1 = __importDefault(require("express"));
// import session from 'express-session';
// import { Pool } from 'pg';
const routes_1 = __importDefault(require("./app/routes"));
// Database configuration
require("./app/config/db");
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
// app.use(cookieParser());
// Connection pool to store session in the database
// const pool = new Pool({
// 	user: config?.databaseUser,
// 	host: config?.databaseHost,
// 	database: config?.databaseName,
// 	password: config?.databasePassword,
// 	port: Number(config?.databasePort),
// });
// Create session client
// const PgSession = pgSession(session);
//  TO ACCESS COOKIE FROM THE FRONTEND  ADD "withCredentials: true" WITH EACH REQUEST
app.use((0, cors_1.default)({
    origin: config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.reactAppBaseUrl,
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Create a new session
// app.use(
// 	session({
// 		store: new PgSession({
// 			pool: pool as any, // provide the Prisma instance connection
// 			tableName: 'session', // specify the name of the session table in the database
// 		}),
// 		secret: config?.sessionSecretKey,
// 		resave: false,
// 		saveUninitialized: false,
// 		cookie: {
// 			secure: false,
// 			httpOnly: true,
// 			maxAge: 30 * 24 * 60 * 60 * 1000, // Session expiration time (1 day) - time in milliseconds
// 		},
// 	})
// );
// Import routes
app.use('/', routes_1.default);
const PORT = config_1.default.port || 8080;
// Server configuration
app.listen(PORT, () => {
    console.log('Server is listening on port ', PORT);
});
