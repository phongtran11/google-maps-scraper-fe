import type { Route } from "./+types/api.businesses.$id.status";
import { pool } from "~/lib/db.server";
import { requireAuth } from "~/lib/require-auth";
import { verifySameOrigin } from "~/lib/csrf.server";

const ALLOWED = ["new", "approached", "contacted", "qualified", "rejected"];

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "PATCH") {
    return new Response("Method not allowed", { status: 405 });
  }

  verifySameOrigin(request);

  await requireAuth(request);

  const formData = await request.formData();
  const status = formData.get("status")?.toString();

  if (!status || !ALLOWED.includes(status)) {
    return new Response("Invalid status", { status: 400 });
  }

  const result = await pool.query(
    `UPDATE businesses SET status = $1 WHERE id = $2 RETURNING status`,
    [status, params.id],
  );

  if (result.rows.length === 0) {
    return new Response("Business not found", { status: 404 });
  }

  return { status: result.rows[0].status };
}
