import { connection } from "next/server";
import { NextResponse } from "next/server";
import { readyDb } from "./db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Cache-Control": "no-store",
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function readJson(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return {};
    return body as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "Send a JSON body");
  }
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return null;
  return email;
}

export async function handle(run: () => Promise<NextResponse>) {
  try {
    await connection();
    await readyDb();
    return await run();
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[vacaypay]", error);
    if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|Access denied|Unknown database|JWT_SECRET|SMTP/i.test(message)) {
      return json({ error: message }, 500);
    }
    return json({ error: "Something went wrong" }, 500);
  }
}
