import type { RouteHandle } from "~/shared/types";

import { BusinessDetails, BusinessSidebar, NotesSection } from "~/features/business";
import { getBusinessById, getBusinessNotes } from "~/features/business/queries.server";
import { parseId } from "~/shared/utils";

import type { Route } from "./+types/$id";

export const handle: RouteHandle = {
  breadcrumb: (data) => {
    const loaderData = data as Route.ComponentProps["loaderData"];
    return loaderData?.business?.businessName ?? "Chi Tiết";
  },
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = parseId(params.id);
  if (!id) {
    throw new Response("Mã doanh nghiệp không hợp lệ", { status: 400 });
  }

  const [business, notes] = await Promise.all([getBusinessById(id), getBusinessNotes(id)]);

  if (!business) {
    throw new Response("Không tìm thấy doanh nghiệp", { status: 404 });
  }

  return { business, notes };
}

export const meta = ({ loaderData }: Route.MetaArgs) => {
  const name = loaderData.business.businessName ?? "Chi Tiết Doanh Nghiệp";
  return [{ title: `${name}` }];
};

export default function BusinessDetail({ loaderData }: Route.ComponentProps) {
  const business = loaderData.business;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <BusinessDetails {...business} />
        <NotesSection businessId={business.id} initialNotes={loaderData.notes} />
      </div>

      <BusinessSidebar
        id={business.id}
        mapsUrl={business.mapsUrl}
        phone={business.phone}
        status={business.status}
      />
    </div>
  );
}
