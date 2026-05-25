import type { LoaderFunctionArgs } from "react-router";
import { getBusinesses } from "~/lib/server/database/businesses.server";
import { getIntParam, getStringParam } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const offset = getIntParam(url, "offset", 0, { min: 0 });
    const limit = getIntParam(url, "limit", 20, { min: 1, max: 50 });
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

    return Response.json({ businesses }, { status: 200 });
  } catch (err) {
    console.error("api.businesses loader error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error", businesses: [] },
      { status: 500 },
    );
  }
}
