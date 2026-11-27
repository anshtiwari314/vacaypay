import { env } from "./env";
import { normalizeEmail } from "./http";
import { sendMail } from "./mail";

export type SignInLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  place: string | null;
};

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Accept a client location only when the coordinates are a real point. */
export function readSignInLocation(value: unknown): SignInLocation | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const latitude = finite(body.latitude);
  const longitude = finite(body.longitude);
  if (latitude == null || longitude == null) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  const accuracy = finite(body.accuracy);
  const place = typeof body.place === "string" ? body.place.replace(/[\r\n]+/g, " ").trim().slice(0, 200) : "";
  return {
    latitude,
    longitude,
    accuracy: accuracy != null && accuracy >= 0 && accuracy <= 100_000 ? accuracy : null,
    place: place || null,
  };
}

export async function notifyFirstSignIn(
  user: { email: string; name: string | null },
  location: SignInLocation | null,
) {
  try {
    const admin = normalizeEmail(env("ADMIN_EMAIL_ID"));
    if (!admin) {
      console.warn("[vacaypay] ADMIN_EMAIL_ID is not set; skipped first sign-in mail");
      return;
    }

    const lines = [
      "Someone signed in to VacayPay for the first time.",
      "",
      `Email: ${user.email}`,
      `Name: ${user.name?.trim() || "—"}`,
    ];
    if (location) {
      const coordinates = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      lines.push(
        `Location: ${location.place || "—"}`,
        `Coordinates: ${coordinates}`,
        `Map: https://maps.google.com/?q=${location.latitude},${location.longitude}`,
      );
      if (location.accuracy != null) lines.push(`Accuracy: about ${Math.round(location.accuracy)} m`);
    } else {
      lines.push("Location: not shared. The person did not allow location access.");
    }

    const result = await sendMail(admin, `New VacayPay sign-in: ${user.email}`, lines.join("\n"));
    if (!result.sent) console.error("[vacaypay] first sign-in mail", result.error);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send first sign-in mail";
    console.error("[vacaypay] first sign-in mail", message);
  }
}
