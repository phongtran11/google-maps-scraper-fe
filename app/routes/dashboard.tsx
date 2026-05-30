import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { DashboardTemplate } from "~/features/dashboard/components/dashboard-template";
import { getDistrictsWithWard } from "~/server/database/districts.server";
import { getBusinesses, getBusinessesCount } from "~/server/database/businesses.server";
import { getIntParam, getStringParam, groupDistrictsWithWards } from "~/shared/utils";

export const meta: MetaFunction = () => [{ title: "Trang Quản Trị" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const wardId = url.searchParams.getAll("wardId");
  const search = getStringParam(url, "search", "", 200);
  const status = getStringParam(url, "status", "", 50);
  const page = getIntParam(url, "page", 1, { min: 1 });
  const limit = getIntParam(url, "limit", 20, { min: 1 });
  const offset = (page - 1) * limit;

  const [businesses, totalCount, districts] = await Promise.all([
    getBusinesses({ search, status, limit, offset, wardId }),
    getBusinessesCount({ search, status, wardId }),
    getDistrictsWithWard(),
  ]);

  const districtsWithWard = groupDistrictsWithWards(districts);

  return { businesses, totalCount, page, limit, districtsWithWard };
}

export default function Dashboard() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <DashboardTemplate
      businesses={loaderData.businesses}
      totalCount={loaderData.totalCount}
      page={loaderData.page}
      pageSize={loaderData.limit}
      districtsWithWard={loaderData.districtsWithWard}
    />
  );
}
