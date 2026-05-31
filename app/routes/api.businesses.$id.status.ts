import type { ActionFunctionArgs } from "react-router";
import { verifySameOrigin } from "~/server/http/csrf.server";
import { db } from "~/server/database/db.server";
import { businesses } from "~/server/database/schema.server";
import { eq } from "drizzle-orm";
import { validateMethod } from "~/server/http/request.server";
import { sessionContext } from "~/server/auth/require-auth.server";
import { NEXT_STATUS } from "~/shared/constants";

const ALLOWED = ["new", "approached", "contacted", "qualified", "rejected"];

export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, "PATCH");
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  if (!session) {
    return Response.json(
      { message: "Không có quyền truy cập", error: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const formData = await request.formData();
    const status = formData.get("status")?.toString();

    if (!status || !ALLOWED.includes(status)) {
      return Response.json(
        { message: "Trạng thái không hợp lệ", error: "invalid_status" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const numId = parseInt(params.id ?? "", 10);
    if (isNaN(numId)) {
      return Response.json(
        { message: "ID không hợp lệ", error: "invalid_id" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const currentResult = await db
      .select({ status: businesses.status })
      .from(businesses)
      .where(eq(businesses.id, numId))
      .limit(1);

    if (currentResult.length === 0) {
      return Response.json(
        { message: "Không tìm thấy doanh nghiệp", error: "business_not_found" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
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
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = await db
      .update(businesses)
      .set({ status })
      .where(eq(businesses.id, numId))
      .returning({ status: businesses.status });

    return Response.json(
      { message: "Status updated successfully", data: result[0] },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Status action error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
