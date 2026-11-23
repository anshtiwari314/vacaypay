import { createHash, randomUUID } from "crypto";
import { jwtVerify, SignJWT } from "jose";
import type { RowDataPacket } from "mysql2";
import { query } from "./db";
import { env } from "./env";
import { HttpError } from "./http";

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

type UserRow = RowDataPacket & {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  google_id: string | null;
};

function secret() {
  const value = env("JWT_SECRET");
  if (!value) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(value);
}

export function publicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

export async function findUserByEmail(email: string) {
  const rows = await query<UserRow[]>("SELECT id, email, name, avatar_url, google_id FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);
  return rows[0] ?? null;
}

export async function findUserById(id: string) {
  const rows = await query<UserRow[]>("SELECT id, email, name, avatar_url, google_id FROM users WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0] ?? null;
}

export async function upsertUser(input: {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
}) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    await query(
      `UPDATE users
       SET name = COALESCE(?, name),
           avatar_url = COALESCE(?, avatar_url),
           google_id = COALESCE(?, google_id)
       WHERE id = ?`,
      [input.name ?? null, input.avatarUrl ?? null, input.googleId ?? null, existing.id],
    );
    return (await findUserById(existing.id))!;
  }

  const id = randomUUID();
  try {
    await query("INSERT INTO users (id, email, name, avatar_url, google_id) VALUES (?, ?, ?, ?, ?)", [
      id,
      input.email,
      input.name ?? null,
      input.avatarUrl ?? null,
      input.googleId ?? null,
    ]);
  } catch (error) {
    const duplicate =
      typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY";
    if (!duplicate) throw error;
    return (await findUserByEmail(input.email))!;
  }
  return (await findUserById(id))!;
}

export async function linkMemberships(user: UserRow) {
  await query("UPDATE group_members SET user_id = ? WHERE email = ?", [user.id, user.email]);
}

export async function signUser(user: UserRow) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function currentUser(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "Sign in again");
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) throw new HttpError(401, "Sign in again");
    const user = await findUserById(payload.sub);
    if (!user) throw new HttpError(401, "Sign in again");
    return user;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Sign in again");
  }
}

export function hashOtp(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}:${env("JWT_SECRET")}`).digest("hex");
}

export function displayName(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email.split("@")[0];
}

export { randomUUID };
