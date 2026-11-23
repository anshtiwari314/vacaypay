import { currentUser, publicUser } from "@/lib/auth";
import { addFriend, listFriends } from "@/lib/data";
import { handle, json, readJson } from "@/lib/http";

export function GET(req: Request) {
  return handle(async () => {
    const user = await currentUser(req);
    return json({ friends: await listFriends(user.email) });
  });
}

export function POST(req: Request) {
  return handle(async () => {
    const user = await currentUser(req);
    const body = await readJson(req);
    const result = await addFriend(publicUser(user), body.email);
    return json(result, 201);
  });
}
