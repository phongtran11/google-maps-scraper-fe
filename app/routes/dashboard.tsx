import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { DashboardTemplate } from "~/features/dashboard/components/dashboard-template";
import {
  getBusinesses,
  getBusinessesCount,
} from "~/lib/server/database/businesses.server";
import { getIntParam, getStringParam } from "~/lib/utils";

export const meta: MetaFunction = () => [{ title: "Trang Quản Trị" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const region = getStringParam(url, "region", "", 200);
  const search = getStringParam(url, "search", "", 200);
  const status = getStringParam(url, "status", "", 50);
  const page = getIntParam(url, "page", 1, { min: 1 });
  const limit = getIntParam(url, "limit", 20, { min: 1 });
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
