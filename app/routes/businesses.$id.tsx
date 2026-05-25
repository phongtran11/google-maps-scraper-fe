import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { pool } from "~/lib/server/db.server";
import type { BusinessRow, NoteRow } from "~/lib/types";
import { BusinessDetails } from "~/features/business-detail/components/business-details";
import { ReviewImages } from "~/features/business-detail/components/review-images";
import { NotesSection } from "~/features/business-detail/components/notes-section";
import { BusinessSidebar } from "~/features/business-detail/components/business-sidebar";
import { PageHeader } from "~/shared/components";

export async function loader({ params }: LoaderFunctionArgs) {
  const businessResult = await pool.query(
    `SELECT * FROM businesses WHERE id = $1`,
    [params.id],
  );
  if (businessResult.rows.length === 0) {
    throw new Response("Không tìm thấy doanh nghiệp", { status: 404 });
  }

  const notesResult = await pool.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [params.id],
  );

  return {
    business: businessResult.rows[0] as BusinessRow,
    notes: notesResult.rows as NoteRow[],
  };
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
        <div className="lg:col-span-2 space-y-6">
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
