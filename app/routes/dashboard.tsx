import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { BusinessTable, FilterBar } from "~/features/business";
import { getBusinesses, getBusinessesCount } from "~/features/business/queries.server";
import { getDistrictsWithWard } from "~/server/database/districts.server";
import { PageHeader } from "~/shared/components";
import { getIntParam, getIntParams, getStringParam, groupDistrictsWithWards } from "~/shared/utils";

import type { Route } from "./+types/dashboard";

export const meta: MetaFunction = () => [{ title: "Trang Quản Trị" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const wardIds = getIntParams(url, "wardId", []);
  const search = getStringParam(url, "search", "", 200);
  const status = getStringParam(url, "status", "", 50);
  const page = getIntParam(url, "page", 1, { min: 1 });
  const limit = getIntParam(url, "limit", 20, { min: 1 });
  const offset = (page - 1) * limit;

  const [businesses, totalCount, districts] = await Promise.all([
    getBusinesses({ search, status, limit, offset, wardIds }),
    getBusinessesCount({ search, status, wardIds }),
    getDistrictsWithWard(),
  ]);

  const districtsWithWard = groupDistrictsWithWards(districts);

  return { businesses, totalCount, page, limit, districtsWithWard };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-8">
      <PageHeader title="Trang quản trị" />

      <FilterBar districtsWithWard={loaderData.districtsWithWard} />

      <BusinessTable
        businesses={loaderData.businesses}
        totalCount={loaderData.totalCount}
        page={loaderData.page}
        pageSize={loaderData.limit}
        districtsWithWard={loaderData.districtsWithWard}
      />
    </div>
  );
}
