import nodemailer from "nodemailer";
import { env } from "./env";

export function mailConfigured() {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

export async function sendMail(to: string, subject: string, text: string) {
  if (!mailConfigured()) {
    return { sent: false as const, error: "SMTP is not configured on the server" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: env("SMTP_HOST"),
      port: Number(env("SMTP_PORT") || 587),
      secure: env("SMTP_SECURE") === "true",
      auth: {
        user: env("SMTP_USER"),
        pass: env("SMTP_PASS"),
      },
    });
    await transporter.sendMail({
      from: env("SMTP_FROM") || env("SMTP_USER"),
      to,
      subject,
      text,
    });
    return { sent: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send email";
    console.error("[vacaypay] mail", message);
    return { sent: false as const, error: message };
  }
}
