"use server"

import axios from "axios";

export async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    const data = response.data;

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, message: "reCAPTCHA validation failed" };
    }
  } catch (error) {
    return { success: false, message: "Server error" };
  }
}
