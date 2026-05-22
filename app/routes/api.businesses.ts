import type { LoaderFunctionArgs } from "react-router";
import { getBusinesses } from "~/lib/server/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = Math.min(Number.parseInt(url.searchParams.get("limit") ?? "20", 10), 50);
  const region = url.searchParams.get("region") || "";
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const businesses = await getBusinesses({ limit, offset, region, search, status });

  return Response.json({ businesses }, { status: 200 });
}
