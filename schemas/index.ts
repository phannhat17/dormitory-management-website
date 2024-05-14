import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const CreateUserSchema = z.object({
  students: z.array(
    z.object({
      studentid: z.string().min(1, {
        message: "Student ID is required",
      }),
      name: z.string().min(1, {
        message: "Name is required",
      }),
      email: z.string().email().min(1, {
        message: "Email is required",
      }),
      gender: z.enum(["MALE", "FEMALE"]).optional(),
    })
  ),
});

export const CreateStaffSchema = z.object({
  staffid: z.string().min(1, {
    message: "Staff id is required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Minimum password length is 8 characters",
  }),
});

export const FeedbackSchema = z.object({
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
});