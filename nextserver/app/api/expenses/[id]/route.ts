import { currentUser, publicUser } from "@/lib/auth";
import { getExpense, updateExpense } from "@/lib/data";
import { handle, json, readJson } from "@/lib/http";

export function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await currentUser(req);
    const { id } = await context.params;
    return json({ expense: await getExpense(user.email, id) });
  });
}

export function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await currentUser(req);
    const { id } = await context.params;
    const body = await readJson(req);
    const description = typeof body.description === "string" ? body.description : "";
    const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
    const expense = await updateExpense({
      user: publicUser(user),
      expenseId: id,
      description,
      amount,
      rawEmails: body.emails,
      paidBy: body.paidBy,
    });
    return json({ expense });
  });
}
