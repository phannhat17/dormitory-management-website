import * as z from "zod";

const passwordPolicySchema = z.string().min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.")
  .regex(/[\!\@\#\$\%\^\&\*]/, "Password must include at least one special character.")
  .refine((val) => !/(.)\1\1/.test(val), "Password must not contain three consecutive identical characters.");

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

export const CreateUserSchema = z.object({
  students: z.array(
    z.object({
      studentid: z.string().min(1, { message: "Student ID is required" }),
      name: z.string().min(1, { message: "Name is required" }),
      email: z.string().email({ message: "Invalid email format" }).transform((str) => str.toLowerCase()),
      gender: z.enum(["MALE", "FEMALE"]).optional(),
    })
  ),
});

export const FeedbackSchema = z.object({
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
});

export const ResetPassword = z.object({
  newPassword: passwordPolicySchema,
  confirmPassword: passwordPolicySchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export const CreateContractSchema = z.object({
  userId: z.string().min(1, { message: "ID is required" }),
  roomId: z.string().min(1, { message: "Room ID is required" }),
  contractType: z.string().min(1, { message: "Room ID is required" }),
  term: z.string().min(1, { message: "Room ID is required" }),
  startDate: z.date(),
  endDate: z.date(),
});
