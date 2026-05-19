import { Link } from "react-router";
import type { Route } from "./+types/businesses.$id";
import { pool } from "~/lib/db.server";
import type { BusinessRow, NoteRow } from "~/lib/types";
import { ChevronLeftIcon } from "~/components/icons/chevron-left";
import { BusinessDetails } from "~/components/organisms/business-details";
import { ReviewImages } from "~/components/organisms/review-images";
import { NotesSection } from "~/components/organisms/notes-section";
import { BusinessSidebar } from "~/components/organisms/business-sidebar";

export function meta({ data }: Route.MetaArgs) {
  const name = data?.business.business_name ?? "Chi Tiết Doanh Nghiệp";
  return [{ title: `${name} - Quản Trị` }];
}

export async function loader({ params }: Route.LoaderArgs) {
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
     WHERE business_id = $1
     ORDER BY created_at DESC`,
    [params.id],
  );

  return {
    business: businessResult.rows[0] as BusinessRow,
    notes: notesResult.rows as NoteRow[],
  };
}

export default function BusinessDetail({ loaderData }: Route.ComponentProps) {
  const b = loaderData.business;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Quay lại
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-lg font-semibold truncate">{b.business_name}</h1>
      </div>

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
