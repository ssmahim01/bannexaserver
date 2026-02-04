import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "./model.user";
import config from "../../config/index";
import { USER_STATUS, USER_ROLES } from "./constant.user";
import { invalidateAllUserTokens } from "../../utils/tokenBlacklist";

export async function createUser(payload: any) {
  const exists = await User.findOne({ email: payload.email });
  if (exists) {
    throw new Error("User already exists");
  }

  const hashedPassword = payload.password
    ? await bcrypt.hash(payload.password, config.bcryptSaltRounds)
    : undefined;

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email,
    password: hashedPassword,
    role: payload.role || USER_ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,

    subscription: {
      plan: "free",
      isActive: false,
    },

    isEmailVerified: payload.isEmailVerified ?? false,
  });

  const { password, ...safeUser } = user.toObject();
  return safeUser;
}

export async function findUserByEmail(email: string) {
  return User.findOne({ email }).select("+password");
}

export async function findUserById(userId: string) {
  return User.findById({_id: userId});
}

export async function verifyPassword(user: any, plainPassword: string) {
  if (!user?.password) return false;
  return bcrypt.compare(plainPassword, user.password);
}

export function signTokens(user: {
  id: string;
  role: string;
  tokenVersion?: number;
}) {
  const payload = {
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  };

  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
}

export async function updateUser(userId: string, data: any) {
  const user = await User.findByIdAndUpdate(userId, data, { new: true }).select(
    "-password",
  );

  return user;
}

export async function changeUserPassword(userId: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

  await User.findByIdAndUpdate(userId, {
    password: hashed,
    $inc: { tokenVersion: 1 },
  });

  await invalidateAllUserTokens(userId);
  return true;
}

export async function listUsers(filter: any = {}, skip = 0, limit = 20) {
  const total = await User.countDocuments(filter);

  const items = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select("-password");

  return { total, items };
}

export async function deleteUser(userId: string) {
  return User.findByIdAndDelete(userId);
}
