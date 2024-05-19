import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  email: string,
  token: string
) => {
    const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

    await resend.emails.send({
      from: "dorm@phannhat.id.vn",
      to: email,
      subject: "Reset Password",
      html: `<p>Click <a href="${resetLink}">Reset Password</a> to reset password!</p>`,
    });
};


export const sendVerificationEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/verification?token=${token}`;

  await resend.emails.send({
    from: "dorm@phannhat.id.vn",
    to: email,
    subject: "Verification",
    html: `<p>Click <a href="${resetLink}">here</a> to verify your email!</p>`,
  });
};