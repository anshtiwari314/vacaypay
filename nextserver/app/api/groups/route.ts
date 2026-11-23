import { currentUser, publicUser } from "@/lib/auth";
import { createGroup, listGroups } from "@/lib/data";
import { handle, json, readJson } from "@/lib/http";

export function GET(req: Request) {
  return handle(async () => {
    const user = await currentUser(req);
    return json({ groups: await listGroups(user.email) });
  });
}

export function POST(req: Request) {
  return handle(async () => {
    const user = await currentUser(req);
    const body = await readJson(req);
    const name = typeof body.name === "string" ? body.name : "";
    const created = await createGroup(publicUser(user), name, body.emails);
    return json(created, 201);
  });
}
