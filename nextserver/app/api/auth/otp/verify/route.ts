import type { RowDataPacket } from "mysql2";
import { hashOtp, linkMemberships, publicUser, signUser, upsertUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { handle, json, normalizeEmail, readJson } from "@/lib/http";
import { notifyFirstSignIn, readSignInLocation } from "@/lib/signup-notice";

type OtpRow = RowDataPacket & {
  id: string;
  code_hash: string;
  expires_at: Date;
  attempts: number;
};

export function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!email || !/^\d{6}$/.test(code)) return json({ error: "Enter the 6-digit code" }, 400);

    const rows = await query<OtpRow[]>(
      "SELECT id, code_hash, expires_at, attempts FROM otp_codes WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1",
      [email],
    );
    const row = rows[0];
    if (!row) return json({ error: "Request a new code" }, 400);
    if (new Date(row.expires_at).getTime() < Date.now()) return json({ error: "That code expired. Request a new one" }, 400);
    if (row.attempts >= 5) return json({ error: "Too many tries. Request a new code" }, 400);
    if (row.code_hash !== hashOtp(email, code)) {
      await query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
      return json({ error: "That code is wrong" }, 400);
    }

    await query("UPDATE otp_codes SET used = 1 WHERE id = ?", [row.id]);
    const { user, created } = await upsertUser({ email });
    await linkMemberships(user);
    if (created) await notifyFirstSignIn(user, readSignInLocation(body.location));
    const token = await signUser(user);
    return json({ token, user: publicUser(user) });
  });
}
