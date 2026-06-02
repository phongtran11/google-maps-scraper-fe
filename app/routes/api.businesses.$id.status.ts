import type { ActionFunctionArgs } from "react-router";

import { NEXT_STATUS } from "~/features/business";
import { updateBusinessStatus } from "~/features/business/mutations.server";
import { getBusinessById } from "~/features/business/queries.server";
import { sessionContext } from "~/server/auth/require-auth.server";
import { verifySameOrigin } from "~/server/http/csrf.server";
import { validateMethod } from "~/server/http/request.server";

const ALLOWED = ["new", "approached", "contacted", "qualified", "rejected"];

export async function action({ context, params, request }: ActionFunctionArgs) {
  validateMethod(request, "PATCH");
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  if (!session) {
    return Response.json(
      { error: "unauthorized", message: "Không có quyền truy cập" },
      { headers: { "Cache-Control": "no-store" }, status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const status = formData.get("status")?.toString();

    if (!status || !ALLOWED.includes(status)) {
      return Response.json(
        { error: "invalid_status", message: "Trạng thái không hợp lệ" },
        { headers: { "Cache-Control": "no-store" }, status: 400 },
      );
    }

    const numId = parseInt(params.id ?? "", 10);
    if (isNaN(numId)) {
      return Response.json(
        { error: "invalid_id", message: "ID không hợp lệ" },
        { headers: { "Cache-Control": "no-store" }, status: 400 },
      );
    }

    const business = await getBusinessById(numId);
    if (!business) {
      return Response.json(
        { error: "business_not_found", message: "Không tìm thấy doanh nghiệp" },
        { headers: { "Cache-Control": "no-store" }, status: 404 },
      );
    }

    const currentStatus = business.status ?? "new";
    const allowedTransitions = NEXT_STATUS[currentStatus] ?? [];

    if (currentStatus !== status && !allowedTransitions.includes(status)) {
      return Response.json(
        {
          error: "invalid_transition",
          message: `Không thể chuyển từ ${currentStatus} sang ${status}`,
        },
        { headers: { "Cache-Control": "no-store" }, status: 400 },
      );
    }

    const result = await updateBusinessStatus(numId, status);

    return Response.json(
      { data: result, message: "Status updated successfully" },
      { headers: { "Cache-Control": "no-store" }, status: 200 },
    );
  } catch (err) {
    console.error("Status action error:", err);
    return Response.json(
      { error: "server_error", message: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { headers: { "Cache-Control": "no-store" }, status: 500 },
    );
  }
}
