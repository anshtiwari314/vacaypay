import { query } from "@/lib/db";
import { handle, json } from "@/lib/http";

export function GET() {
  return handle(async () => {
    await query("SELECT 1 AS ok");
    return json({ ok: true, service: "vacaypay" });
  });
}
