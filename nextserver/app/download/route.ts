import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { connection } from "next/server";

function apkPath() {
  const candidates = [
    process.env.APK_PATH,
    path.join(process.cwd(), "public", "vacaypay.apk"),
    path.join(process.cwd(), "..", "mobileApp", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
  ].filter((item): item is string => Boolean(item));
  return candidates.find((file) => existsSync(file)) ?? null;
}

export async function GET() {
  await connection();
  const file = apkPath();
  if (!file) {
    return new Response("The Android build is not on this server yet.", { status: 404 });
  }
  const size = statSync(file).size;
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="vacaypay.apk"',
      "Content-Length": String(size),
    },
  });
}
