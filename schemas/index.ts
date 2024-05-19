import { Gender } from "@prisma/client";
import * as z from "zod";

const passwordPolicySchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.")
  .regex(
    /[\!\@\#\$\%\^\&\*]/,
    "Password must include at least one special character."
  )
  .refine(
    (val) => !/(.)\1\1/.test(val),
    "Password must not contain three consecutive identical characters."
  );

export const LoginSchema = z.object({
  email: z.string().email().min(1, {
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const ResetFromSchema = z.object({
  email: z.string().email().min(1, {
    message: "Email is required",
  }),
});

export const ResetPassword = z
  .object({
    newPassword: passwordPolicySchema,
    confirmPassword: passwordPolicySchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const ResetPasswordLoggedIn = z
  .object({
    oldPassword: z.string().min(1, {
      message: "Old password is required",
    }),

    newPassword: passwordPolicySchema,
    confirmPassword: passwordPolicySchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export const CreateUserSchema = z.object({
  students: z.array(
    z.object({
      studentid: z.string().min(1, { message: "Student ID is required" }),
      name: z.string().min(1, { message: "Name is required" }),
      email: z
        .string()
        .email({ message: "Invalid email format" })
        .transform((str) => str.toLowerCase()),
      gender: z.enum(["MALE", "FEMALE"]).optional(),
    })
  ),
});

export const FeedbackSchema = z.object({
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
});

export const CreateContractSchema = z.object({
  userId: z.string().min(1, { message: "ID is required" }),
  roomId: z.string().min(1, { message: "Room ID is required" }),
  contractType: z.string().min(1, { message: "Room ID is required" }),
  term: z.string().min(1, { message: "Room ID is required" }),
  startDate: z.date(),
  endDate: z.date(),
});

export const updateRoomSchema = z.object({
  originalId: z.string(),
  newId: z.string(),
  gender: z.nativeEnum(Gender),
  price: z.number().positive(),
  max: z.number(),
  facilities: z.array(
    z.object({
      id: z.string().optional(),
      status: z.string(),
      price: z.number().positive(),
    })
  ),
  users: z.array(z.string()),
});

export const UpdateFacilitySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Facility name is required"),
  number: z.number().positive("Number must be a positive integer"),
  status: z.string().min(1, "Status is required"),
  price: z.number().positive("Price must be a positive number"),
});

export const CreateFacilitySchema = z.object({
  name: z.string().min(1, "Facility name is required"),
  number: z.number().positive("Number must be a positive integer"),
  status: z.string().min(1, "Status is required"),
  currentRoomId: z.string().min(1, "Room ID is required"),
  price: z.number().positive("Price must be a positive number"),
});

