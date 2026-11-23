import { randomInt, randomUUID } from "crypto";
import { hashOtp } from "@/lib/auth";
import { query } from "@/lib/db";
import { handle, json, normalizeEmail, readJson } from "@/lib/http";
import { sendMail } from "@/lib/mail";

export function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    if (!email) return json({ error: "Enter a valid email" }, 400);

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await query("DELETE FROM otp_codes WHERE email = ?", [email]);
    await query("INSERT INTO otp_codes (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)", [
      randomUUID(),
      email,
      hashOtp(email, code),
      expires,
    ]);

    const mailed = await sendMail(
      email,
      "Your VacayPay sign-in code",
      `Your VacayPay code is ${code}. It expires in 10 minutes.\n\nIf you didn't ask for this, you can ignore the email.`,
    );

    if (!mailed.sent) {
      if (process.env.NODE_ENV === "production") {
        return json({ error: mailed.error ?? "Could not send the code" }, 503);
      }
      console.info(`[vacaypay] OTP for ${email}: ${code}`);
      return json({
        sent: false,
        previewCode: code,
        message: "Mail is not configured, so the code is shown here and in the server log.",
      });
    }

    return json({ sent: true, message: "Code sent" });
  });
}
