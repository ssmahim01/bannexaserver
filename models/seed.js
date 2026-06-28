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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../src/config"));
const model_user_1 = __importDefault(require("../src/modules/users/model.user"));
const logger_1 = __importDefault(require("../src/utils/logger"));
function seedAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.databaseUrl);
            logger_1.default.info("✅ MongoDB connected for seeding");
            const adminEmail = "admin@bannexa.com";
            const existingAdmin = yield model_user_1.default.findOne({ email: adminEmail });
            if (existingAdmin) {
                logger_1.default.info("ℹ️ Admin already exists. Skipping seed.");
                return;
            }
            const hashedPassword = yield bcrypt_1.default.hash("bannexa@123", config_1.default.bcryptSaltRounds);
            const admin = yield model_user_1.default.create({
                fullName: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                status: "active",
                phone: "01700000000",
                country: "Bangladesh",
                city: "Dhaka",
                isEmailVerified: true,
            });
            logger_1.default.info("✅ Admin seeded successfully");
            logger_1.default.info(admin.email);
        }
        catch (error) {
            logger_1.default.error("❌ Seed failed", error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            process.exit(0);
        }
    });
}
seedAdmin();
