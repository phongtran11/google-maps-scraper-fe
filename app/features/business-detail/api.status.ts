import type { ActionFunctionArgs } from "react-router";
import { pool } from "~/lib/server/db.server";
import { requireAuth } from "~/lib/server/require-auth.server";
import { verifySameOrigin } from "~/lib/server/csrf.server";

const ALLOWED = ["new", "approached", "contacted", "qualified", "rejected"];

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "PATCH") {
    return Response.json(
      {
        message: "Method not allowed",
        error: "method_not_allowed",
      },
      { status: 405 },
    );
  }

  verifySameOrigin(request);

  await requireAuth(request);

  const formData = await request.formData();
  const status = formData.get("status")?.toString();

  if (!status || !ALLOWED.includes(status)) {
    return Response.json(
      {
        message: "Invalid status",
        error: "invalid_status",
      },
      { status: 400 },
    );
  }

  const result = await pool.query(
    `UPDATE businesses SET status = $1 WHERE id = $2 RETURNING status`,
    [status, params.id],
  );

  if (result.rows.length === 0) {
    return Response.json(
      {
        message: "Business not found",
        error: "business_not_found",
      },
      { status: 404 },
    );
  }

  return Response.json(
    {
      message: "Status updated successfully",
      data: result.rows[0],
    },
    { status: 200 },
  );
}
