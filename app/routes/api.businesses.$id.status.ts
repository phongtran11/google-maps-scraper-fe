import type { ActionFunctionArgs } from "react-router";
import { verifySameOrigin } from "~/lib/server/csrf.server";
import { sql } from "~/lib/server/database/db.server";
import { validateMethod } from "~/lib/server/request.server";

const ALLOWED = ["new", "approached", "contacted", "qualified", "rejected"];

export async function action({ request, params }: ActionFunctionArgs) {
  validateMethod(request, "PATCH");
  verifySameOrigin(request);

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

  const result = await sql.query(
    `UPDATE businesses SET status = $1 WHERE id = $2 RETURNING status`,
    [status, params.id],
  );

  if (result.length === 0) {
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
      data: result[0],
    },
    { status: 200 },
  );
}
