import { currentUser } from "@/lib/auth";
import { getGroup } from "@/lib/data";
import { handle, json } from "@/lib/http";

export function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await currentUser(req);
    const { id } = await context.params;
    return json({ group: await getGroup(user.email, id) });
  });
}
