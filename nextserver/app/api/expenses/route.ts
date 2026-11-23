import { currentUser, publicUser } from "@/lib/auth";
import { createExpense } from "@/lib/data";
import { handle, json, readJson } from "@/lib/http";

export function POST(req: Request) {
  return handle(async () => {
    const user = await currentUser(req);
    const body = await readJson(req);
    const description = typeof body.description === "string" ? body.description : "";
    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
    const groupId = typeof body.groupId === "string" && body.groupId ? body.groupId : null;
    const expense = await createExpense({
      user: publicUser(user),
      description,
      amount,
      groupId,
      rawEmails: body.emails,
      paidBy: body.paidBy,
    });
    return json({ expense }, 201);
  });
}
