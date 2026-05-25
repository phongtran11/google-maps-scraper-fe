import type { ActionFunctionArgs } from "react-router";
import { verifySameOrigin } from "~/lib/server/csrf.server";
import { sql } from "~/lib/server/database/db.server";
import { validateMethod } from "~/lib/server/request.server";
import { sessionContext } from "~/lib/server/require-auth.server";
import { NEXT_STATUS } from "~/lib/constants";

const ALLOWED = ["new", "approached", "contacted", "qualified", "rejected"];

export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, "PATCH");
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  if (!session) {
    return Response.json(
      { message: "Unauthorized", error: "unauthorized" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const status = formData.get("status")?.toString();

  if (!status || !ALLOWED.includes(status)) {
    return Response.json(
      { message: "Invalid status", error: "invalid_status" },
      { status: 400 },
    );
  }

  const currentResult = await sql.query(
    `SELECT status FROM businesses WHERE id = $1`,
    [params.id],
  );

  if (currentResult.length === 0) {
    return Response.json(
      { message: "Business not found", error: "business_not_found" },
      { status: 404 },
    );
  }

  const currentStatus = currentResult[0].status;
  const allowedTransitions = NEXT_STATUS[currentStatus] ?? [];

  if (currentStatus !== status && !allowedTransitions.includes(status)) {
    return Response.json(
      {
        message: `Không thể chuyển từ ${currentStatus} sang ${status}`,
        error: "invalid_transition",
      },
      { status: 400 },
    );
  }

  const result = await sql.query(
    `UPDATE businesses SET status = $1 WHERE id = $2 RETURNING status`,
    [status, params.id],
  );

  return Response.json(
    { message: "Status updated successfully", data: result[0] },
    { status: 200 },
  );
}
