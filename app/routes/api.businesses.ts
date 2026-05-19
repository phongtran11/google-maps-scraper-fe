import type { Route } from "./+types/api.businesses";
import { requireAuth } from "~/lib/require-auth";

export async function loader({ request }: Route.LoaderArgs) {
  const { getBusinesses } = await import("~/lib/db.server");
  await requireAuth(request);

  const url = new URL(request.url);
  const offset = Number.parseInt(url.searchParams.get("offset") ?? "0", 10);
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? "20", 10),
    50,
  );
  const area = url.searchParams.get("area") || "";

  return getBusinesses({
    limit,
    offset,
    area,
  });
}
