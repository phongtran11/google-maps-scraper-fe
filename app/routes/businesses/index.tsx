import type { RouteHandle } from "~/shared/types";

import { BusinessTable, FilterBar } from "~/features/business";
import { getBusinesses, getBusinessesCount } from "~/features/business/queries.server";
import { getDistrictsWithWard } from "~/server/database/districts.server";
import { getIntParam, getIntParams, getStringParam, groupDistrictsWithWards } from "~/shared/utils";

import type { Route } from "./+types/index";

export const meta: Route.MetaFunction = () => [{ title: "Khách Hàng" }];

export const handle: RouteHandle = {
  breadcrumb: () => "Khách Hàng",
};

export default function Businesses({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <FilterBar districtsWithWard={loaderData.districtsWithWard} />

      <BusinessTable
        businesses={loaderData.businesses}
        districtsWithWard={loaderData.districtsWithWard}
        page={loaderData.page}
        pageSize={loaderData.limit}
        totalCount={loaderData.totalCount}
      />
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const wardIds = getIntParams(url, "wardId", []);
  const search = getStringParam(url, "search", "", 200);
  const status = getStringParam(url, "status", "", 50);
  const page = getIntParam(url, "page", 1, { min: 1 });
  const limit = getIntParam(url, "limit", 20, { min: 1 });
  const offset = (page - 1) * limit;

  const [businesses, totalCount, districts] = await Promise.all([
    getBusinesses({ limit, offset, search, status, wardIds }),
    getBusinessesCount({ search, status, wardIds }),
    getDistrictsWithWard(),
  ]);

  const districtsWithWard = groupDistrictsWithWards(districts);

  return { businesses, districtsWithWard, limit, page, totalCount };
}
