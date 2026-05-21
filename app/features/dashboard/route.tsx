import { useCallback } from "react";
import type { Route } from "./+types/dashboard";
import { useRouteLoaderData, useSearchParams } from "react-router";
import type { loader as appLayoutLoader } from "./app-layout";
import type { BusinessRow } from "~/lib/types";
import { AREAS } from "~/lib/constants";
import { Spinner } from "~/components/icons/spinner";
import { BusinessCard } from "~/components/molecules/business-card";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Trang Quản Trị" }];
}

const PAGE_SIZE = 20;

export async function loader({ request }: Route.LoaderArgs) {
  const { getBusinesses } = await import("~/lib/db.server");
  const url = new URL(request.url);
  const area = url.searchParams.get("area") || "";

  return {
    businesses: await getBusinesses({
      area,
      limit: PAGE_SIZE,
    }),
  };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof appLayoutLoader>("routes/app-layout");
  const [searchParams, setSearchParams] = useSearchParams();
  const area = searchParams.get("area") || "";

  const fetchUrl = useCallback(
    (offset: number) => {
      const areaParam = area ? `&area=${encodeURIComponent(area)}` : "";
      return `/api/businesses?offset=${offset}&limit=${PAGE_SIZE}${areaParam}`;
    },
    [area],
  );

  const {
    items: businesses,
    sentinelRef,
    isFetching,
  } = useInfiniteScroll<BusinessRow>({
    initialItems: loaderData.businesses,
    pageSize: PAGE_SIZE,
    fetchUrl,
    resetKey: area,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trang quảng trị</h2>
        <p className="text-muted-foreground">
          Chào mừng trở lại, {data!.user.name}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => {
              if (area === a) {
                searchParams.delete("area");
              } else {
                searchParams.set("area", a);
              }
              setSearchParams(searchParams);
            }}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              area === a
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>

      <div ref={sentinelRef} />

      {isFetching && (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {businesses.length === 0 && (
        <p className="text-center text-muted-foreground py-16">
          {area
            ? `Không có doanh nghiệp nào tại ${area}.`
            : "Chưa có doanh nghiệp nào được thu thập."}
        </p>
      )}
    </div>
  );
}
