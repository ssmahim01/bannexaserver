import { z } from "zod";
import { USER_ROLES, USER_STATUS } from "./constant.user";

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),

    phone: z.string().min(10).optional(),
    profileImage: z.string().url().optional(),

    role: z
      .enum([
        USER_ROLES.CUSTOMER,
        USER_ROLES.CREATOR,
        USER_ROLES.MANAGER,
      ])
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    profileImage: z.string().url().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});

export const adminListUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    role: z.enum(Object.values(USER_ROLES) as [string]).optional(),
    status: z.enum(Object.values(USER_STATUS) as [string]).optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});