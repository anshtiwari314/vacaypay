import { linkMemberships, publicUser, signUser, upsertUser } from "@/lib/auth";
import { profileFromAccessToken, profileFromIdToken } from "@/lib/google";
import { handle, json, readJson } from "@/lib/http";
import { notifyFirstSignIn, readSignInLocation } from "@/lib/signup-notice";

export function POST(req: Request) {
  return handle(async () => {
    const body = await readJson(req);
    const idToken = typeof body.idToken === "string" ? body.idToken : "";
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    if (!idToken && !accessToken) return json({ error: "Missing Google token" }, 400);

    const profile = idToken ? await profileFromIdToken(idToken) : await profileFromAccessToken(accessToken);
    const { user, created } = await upsertUser(profile);
    await linkMemberships(user);
    if (created) await notifyFirstSignIn(user, readSignInLocation(body.location));
    const token = await signUser(user);
    return json({ token, user: publicUser(user) });
  });
}
