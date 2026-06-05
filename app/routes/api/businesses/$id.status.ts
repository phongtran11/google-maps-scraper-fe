import { z } from "zod";
import { zfd } from "zod-form-data";

import { updateBusinessStatus } from "~/features/business/mutations.server";
import { getBusinessById } from "~/features/business/queries.server";
import { verifySameOrigin } from "~/server/http/csrf.server";
import { validateMethod } from "~/server/http/request.server";
import { apiError, apiNotFound, apiServerError, apiSuccess } from "~/server/http/responses.server";
import { parseId } from "~/shared/utils";

import type { Route } from "./+types/$id.status";

const ALLOWED_STATUSES = ["new", "approached", "contacted", "qualified", "rejected"] as const;

const StatusSchema = zfd.formData({
  status: zfd.text(
    z.enum(ALLOWED_STATUSES, {
      message: "Trạng thái không hợp lệ",
    }),
  ),
});

export async function action({ params, request }: Route.ActionArgs) {
  validateMethod(request, "PATCH");
  verifySameOrigin(request);

  try {
    const method = request.method.toUpperCase();
    const formData = await request.formData();

    switch (method) {
      case "PATCH":
        return await handlePatch(params, formData);
      default:
        return apiServerError();
    }
  } catch (err) {
    console.error("Status action error:", err);
    return apiServerError();
  }
}

async function handlePatch(params: Route.ActionArgs["params"], formData: FormData) {
  const parsed = StatusSchema.safeParse(formData);

  if (!parsed.success) {
    return apiError("invalid_status", parsed.error.issues[0].message);
  }

  const { status } = parsed.data;

  const numId = parseId(params.id);
  if (numId === null) {
    return apiError("invalid_id", "ID không hợp lệ");
  }

  const business = await getBusinessById(numId);
  if (!business) {
    return apiNotFound("Không tìm thấy doanh nghiệp");
  }

  const result = await updateBusinessStatus(numId, status);

  return apiSuccess(result, "Status updated successfully", {
    headers: { "Cache-Control": "no-store" },
  });
}
