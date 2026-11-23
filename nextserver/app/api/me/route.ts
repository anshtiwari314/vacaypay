import { currentUser, publicUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";

export function GET(req: Request) {
  return handle(async () => {
    const user = await currentUser(req);
    return json({ user: publicUser(user) });
  });
}
