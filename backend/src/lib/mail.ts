import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

function smtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
): Promise<void> {
  if (!smtpConfigured()) {
    throw new AppError(
      'Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.',
      503,
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'B4 password reset code',
    text: `Your B4 reset code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family: sans-serif; color: #0B1F1A;">
        <h2>Reset your B4 password</h2>
        <p>Use this code in the app:</p>
        <p style="font-size: 28px; letter-spacing: 4px; font-weight: 700;">${code}</p>
        <p style="color: #4A5C56;">Expires in 15 minutes. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
}
