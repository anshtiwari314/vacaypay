import fs from "fs";
import path from "path";

let loaded = false;

export function repoEnvPath(): string | null {
  const candidates = [
    path.resolve(__dirname, "..", "..", ".env"),
    path.resolve(process.cwd(), "..", ".env"),
    path.join(process.cwd(), ".env"),
  ];
  const seen = new Set<string>();
  for (const file of candidates) {
    const key = file.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

/** Next loads KEY=value lines. Also accept the colon form already used in .env. */
export function loadEnvFile() {
  if (loaded) return;
  loaded = true;
  const file = repoEnvPath();
  if (!file) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    const colon = line.indexOf(":");
    const sep = eq !== -1 && (colon === -1 || eq < colon) ? eq : colon;
    if (sep <= 0) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function env(name: string) {
  loadEnvFile();
  return process.env[name] ?? process.env[name.toLowerCase()] ?? "";
}

export function dbConfig() {
  loadEnvFile();
  const database = env("DB_NAME") || "vacaype";
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error("DB_NAME may only contain letters, numbers, and underscores");
  }
  return {
    host: env("DB_HOST") || "192.168.1.42",
    port: Number(env("DB_PORT") || 5246),
    database,
    user: env("DB_USER") || env("db_user"),
    password: env("DB_PASS") || env("db_pass"),
  };
}

export function googleClientIds() {
  return ["GOOGLE_CLIENT_ID_WEB", "GOOGLE_CLIENT_ID_ANDROID", "GOOGLE_CLIENT_ID_IOS"]
    .map((key) => env(key).trim())
    .filter(Boolean);
}
