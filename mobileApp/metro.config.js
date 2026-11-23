const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const rootEnv = path.resolve(__dirname, "..", ".env");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
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

loadEnvFile(rootEnv);

module.exports = getDefaultConfig(__dirname);