import type { LoaderFunctionArgs } from "react-router";
import { requireAuth } from "~/lib/server/require-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { getBusinesses } = await import("~/lib/server/db.server");
  await requireAuth(request);

  const url = new URL(request.url);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 50);
  const area = url.searchParams.get("area") || "";
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

  const businesses = await getBusinesses({ limit, offset, area, search, status });

  return Response.json({ businesses }, { status: 200 });
}
