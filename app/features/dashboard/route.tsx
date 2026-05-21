import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import type { BusinessRow } from "~/lib/types";
import { DashboardTemplate } from "./components/dashboard-template";

export const meta: MetaFunction = () => [{ title: "Trang Quản Trị" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getBusinesses, getBusinessesCount } = await import("~/lib/server/db.server");
  const url = new URL(request.url);
  const area = url.searchParams.get("area") || "";
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = Math.max(
    1,
    Number.parseInt(url.searchParams.get("page") ?? "1", 10),
  );
  const limit = Math.max(
    10,
    Number.parseInt(url.searchParams.get("limit") ?? "10"),
  );
  const offset = (page - 1) * limit;

  const [businesses, totalCount] = await Promise.all([
    getBusinesses({ area, search, status, limit, offset }),
    getBusinessesCount({ area, search, status }),
  ]);

  return { businesses, totalCount, page, limit };
}

export default function Dashboard() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <DashboardTemplate
      businesses={loaderData.businesses}
      totalCount={loaderData.totalCount}
      page={loaderData.page}
      pageSize={loaderData.limit}
    />
  );
}
