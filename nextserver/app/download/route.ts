import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { connection } from "next/server";

/** Fixed in-container path — must match the web service volume mount in docker-compose.yml. */
const DOCKER_APK = "/apk/download.apk";

function apkPath() {
  const apkFile = process.env.APK_FILE?.trim();
  const candidates = [
    DOCKER_APK,
    apkFile || null,
    path.join(process.cwd(), "public", "vacaypay.apk"),
    path.join(process.cwd(), "..", "mobileApp", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
  ].filter((item): item is string => Boolean(item));
  return candidates.find((file) => existsSync(file)) ?? null;
}

function apkNotFoundMessage(): string {
  if (existsSync(DOCKER_APK) && statSync(DOCKER_APK).isDirectory()) {
    return [
      "APK mount error: /apk/download.apk is a folder inside the container.",
      "That usually means APK_FILE did not point to an existing file when the web container was created.",
      "On the host: check the path, then run: docker compose up -d --force-recreate web",
    ].join(" ");
  }
  const host = process.env.APK_FILE?.trim();
  if (host) {
    return [
      "The Android build is not on this server yet.",
      `APK_FILE is set to: ${host}`,
      "Ensure that file exists on the Pi before starting/recreating the web container.",
    ].join(" ");
  }
  return "The Android build is not on this server yet. Set APK_FILE in the repo-root .env to the full host path of your .apk.";
}

export async function GET() {
  await connection();
  const file = apkPath();
  if (!file) {
    return new Response(apkNotFoundMessage(), { status: 404 });
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