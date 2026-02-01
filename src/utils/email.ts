import nodemailer from "nodemailer";
import logger from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const info = await transporter.sendMail({
      from: `AMDADS <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(`📧 Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error("❌ Error sending email:", error);
    return null;
  }
};
