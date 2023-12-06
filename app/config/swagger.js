"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Swagger Demo API',
        version: '1.0.0',
        description: 'A simple API for learning Swagger',
    },
    servers: [
        {
            url: 'http://localhost:8080',
            description: 'Development server',
        },
    ],
};
const swaggerOptions = {
    swaggerDefinition,
    apis: [
        path_1.default.join(__dirname, '..', 'routes', 'index.ts'),
        path_1.default.join(__dirname, '..', 'routes', 'index.js'),
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerSpec;
