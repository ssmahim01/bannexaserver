import bcrypt from "bcrypt";
import mongoose from "mongoose";
import config from "../src/config";
import User from "../src/modules/users/model.user";
import logger from "../src/utils/logger";

async function seedAdmin() {
  try {
    await mongoose.connect(config.databaseUrl);
    logger.info("✅ MongoDB connected for seeding");

    const adminEmail = "admin@bannexa.com";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info("ℹ️ Admin already exists. Skipping seed.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "bannexa@123",
      config.bcryptSaltRounds,
    );

    const admin = await User.create({
      fullName: "Super Admin",
      email: adminEmail,
      pass: hashedPassword,
      role: "admin",
      status: "active",
      phone: "01700000000",
      country: "Bangladesh",
      city: "Dhaka",
      isEmailVerified: true,
    });

    logger.info("✅ Admin seeded successfully");
    logger.info(admin.email);
  } catch (error) {
    logger.error("❌ Seed failed", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
