import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { DashboardTemplate } from "~/features/dashboard/components/dashboard-template";
import { getBusinesses, getBusinessesCount } from "~/lib/server/db.server";

export const meta: MetaFunction = () => [{ title: "Trang Quản Trị" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region") || "";
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = Math.max(
    1,
    Number.parseInt(url.searchParams.get("page") ?? "1", 10),
  );
  const limit = Math.max(
    20,
    Number.parseInt(url.searchParams.get("limit") ?? "20"),
  );
  const offset = (page - 1) * limit;

  const [businesses, totalCount] = await Promise.all([
    getBusinesses({ region, search, status, limit, offset }),
    getBusinessesCount({ region, search, status }),
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
