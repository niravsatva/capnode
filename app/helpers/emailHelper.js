"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = require("../utils/logger");
// Nodemailer transporter configuration
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.smtpHost,
    port: Number(config_1.default.smtpPort),
    secure: false,
    auth: {
        user: config_1.default.smtpEmailLogin,
        pass: config_1.default.smtpPassword,
    },
});
// Send Email
const sendEmail = (options) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => {
            if (error) {
                logger_1.logger.error('Error sending email:', error);
                reject(error);
            }
            resolve(info);
        });
    });
    // Send the email with the reset token
    // const mailOptions = {
    // 	from: process.env.SMTP_USER,
    // 	to: email,
    // 	subject: 'Password Reset',
    // 	// text: `Please use the following token to reset your password: ${resetToken}`,
    // };
};
exports.default = sendEmail;
