import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getBusinessById } from "~/lib/server/database/businesses.server";
import { getBusinessNotes } from "~/lib/server/database/business-notes.server";
import { BusinessDetails } from "~/features/business-detail/components/business-details";
import { ReviewImages } from "~/features/business-detail/components/review-images";
import { NotesSection } from "~/features/business-detail/components/notes-section";
import { BusinessSidebar } from "~/features/business-detail/components/business-sidebar";
import { PageHeader } from "~/shared/components";

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    if (!params.id) {
      throw new Response("Mã doanh nghiệp không hợp lệ", { status: 400 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      throw new Response("Mã doanh nghiệp không hợp lệ", { status: 400 });
    }

    const [business, notes] = await Promise.all([getBusinessById(id), getBusinessNotes(id)]);

    if (!business) {
      throw new Response("Không tìm thấy doanh nghiệp", { status: 404 });
    }

    return { business, notes };
  } catch (err) {
    if (err instanceof Response) throw err;
    console.error("Business detail loader error:", err);
    throw new Response("Lỗi máy chủ. Vui lòng thử lại sau.", { status: 500 });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const name = data?.business.business_name ?? "Chi Tiết Doanh Nghiệp";
  return [{ title: `${name} - Quản Trị` }];
};

export default function BusinessDetail() {
  const loaderData = useLoaderData<typeof loader>();
  const b = loaderData.business;

  return (
    <div className="space-y-6">
      <PageHeader title={b.business_name} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BusinessDetails business={b} />
          {b.review_image_urls && b.review_image_urls.length > 0 && (
            <ReviewImages urls={b.review_image_urls} />
          )}
          <NotesSection businessId={b.id} initialNotes={loaderData.notes} />
        </div>

        <BusinessSidebar business={b} />
      </div>
    </div>
  );
}
