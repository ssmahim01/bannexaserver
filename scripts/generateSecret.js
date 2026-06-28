"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function generateSecret(bytes = 64) {
    return crypto_1.default.randomBytes(bytes).toString("hex");
}
console.log("JWT_ACCESS_SECRET =", generateSecret(64));
console.log("JWT_REFRESH_SECRET =", generateSecret(128));
