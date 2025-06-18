"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokensWithLogin = generateTokensWithLogin;
// TypeScript wrapper for our custom recaptcha solver
// eslint-disable-next-line @typescript-eslint/no-require-imports
const generateCaptchaTokensWithVisual = require("./generateCaptchaTokensWithVisual");
async function generateTokensWithLogin(config) {
    return generateCaptchaTokensWithVisual(config);
}
