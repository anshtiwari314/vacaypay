import { OAuth2Client } from "google-auth-library";
import { googleClientIds } from "./env";
import { HttpError } from "./http";

export type GoogleProfile = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  googleId: string;
};

type GoogleClaims = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean | string;
};

function audiences() {
  const ids = googleClientIds();
  if (!ids.length) {
    throw new HttpError(
      400,
      "Google sign-in is not configured. Set GOOGLE_CLIENT_ID_WEB, GOOGLE_CLIENT_ID_ANDROID, and/or GOOGLE_CLIENT_ID_IOS on the server.",
    );
  }
  return ids;
}

function profileFromClaims(payload: GoogleClaims | undefined): GoogleProfile {
  if (!payload?.email || !payload.sub) throw new HttpError(400, "Google did not return an email");
  if (payload.email_verified === false || payload.email_verified === "false") {
    throw new HttpError(400, "That Google account email is not verified");
  }
  return {
    email: payload.email.trim().toLowerCase(),
    name: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
    googleId: payload.sub,
  };
}

export async function profileFromIdToken(idToken: string) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({ idToken, audience: audiences() });
  return profileFromClaims(ticket.getPayload());
}

export async function profileFromAccessToken(accessToken: string) {
  const allowed = new Set(audiences());
  const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  if (!infoRes.ok) throw new HttpError(401, "Google rejected that sign-in");
  const info = (await infoRes.json()) as { aud?: string; email?: string; email_verified?: string };
  if (!info.aud || !allowed.has(info.aud)) throw new HttpError(401, "That Google sign-in is for a different app");
  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) throw new HttpError(401, "Google rejected that sign-in");
  const user = (await userRes.json()) as { sub?: string; email?: string; name?: string; picture?: string; email_verified?: boolean };
  return profileFromClaims({
    sub: user.sub,
    email: user.email,
    name: user.name,
    picture: user.picture,
    email_verified: user.email_verified ?? info.email_verified,
  });
}
