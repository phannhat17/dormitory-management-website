import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, {
        message: "Password is required"
    }),
});

export const CreateUserSchema = z.object({
  studentid: z.string().min(1, {
    message: "Student id is required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Minimum password length is 8 characters",
  }),
});