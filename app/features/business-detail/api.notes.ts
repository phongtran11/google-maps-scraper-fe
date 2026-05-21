import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { pool } from "~/lib/server/db.server";
import { requireAuth } from "~/lib/server/require-auth.server";
import { verifySameOrigin } from "~/lib/server/csrf.server";

const MAX_NOTE_LENGTH = 5000;

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);

  const result = await pool.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1
     ORDER BY created_at DESC`,
    [params.id],
  );

  return { notes: result.rows };
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { message: "Method not allowed", error: "method_not_allowed" },
      { status: 405 },
    );
  }

  verifySameOrigin(request);

  const session = await requireAuth(request);

  const formData = await request.formData();
  const content = formData.get("content")?.toString()?.trim();

  if (!content) {
    return Response.json(
      { message: "Content is required", error: "content_required" },
      { status: 400 },
    );
  }

  if (content.length > MAX_NOTE_LENGTH) {
    return Response.json(
      { message: "Content is too long", error: "content_too_long" },
      { status: 400 },
    );
  }

  const businessCheck = await pool.query(
    `SELECT 1 FROM businesses WHERE id = $1`,
    [params.id],
  );

  if (businessCheck.rows.length === 0) {
    return Response.json(
      { message: "Business not found", error: "business_not_found" },
      { status: 404 },
    );
  }

  const result = await pool.query(
    `INSERT INTO business_notes (business_id, content, created_by)
     VALUES ($1, $2, $3)`,
    [params.id, content, session.user.email],
  );

  const notes = await pool.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1
     ORDER BY created_at DESC`,
    [params.id],
  );

  return Response.json({ notes: notes.rows }, { status: 201 });
}
