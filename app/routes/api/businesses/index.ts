import { getBusinesses } from "~/features/business/queries.server";
import { apiServerError, apiSuccess } from "~/server/http/responses.server";
import { getIntParam, getStringParam } from "~/shared/utils";

import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const offset = getIntParam(url, "offset", 0, { min: 0 });
    const limit = getIntParam(url, "limit", 20, { max: 50, min: 1 });
    const region = getStringParam(url, "region", "", 200);
    const search = getStringParam(url, "search", "", 200);
    const status = getStringParam(url, "status", "", 50);

    const businesses = await getBusinesses({
      limit,
      offset,
      region,
      search,
      status,
    });

    return apiSuccess({ businesses }, "success", {
      headers: { "Cache-Control": "private, max-age=10" },
    });
  } catch (err) {
    console.error("api.businesses loader error:", err);
    // Vẫn trả về mảng rỗng để UI không bị crash khi không có dữ liệu
    return apiServerError();
  }
}
