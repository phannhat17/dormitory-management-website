import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  email: string,
  token: string
) => {
    const resetLink = `https://dorm.phannhat.id.vn/auth/new-password?token=${token}`;

    await resend.emails.send({
      from: "dorm@phannhat.id.vn",
      to: email,
      subject: "Reset Password",
      html: `<p>Click <a href="${resetLink}">Reset Password</a> to reset password!</p>`,
    });
};


export const sendVerificationEmail = async (email: string, token: string) => {
  const resetLink = `https://dorm.phannhat.id.vn/auth/verification?token=${token}`;

  await resend.emails.send({
    from: "dorm@phannhat.id.vn",
    to: email,
    subject: "Verification",
    html: `<p>Click <a href="${resetLink}">here</a> to verify your email!</p>`,
  });
};


export const sendTwoFATokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "dorm@phannhat.id.vn",
    to: email,
    subject: "Verification",
    html: `Two FA Token: ${token}`,
  });
};