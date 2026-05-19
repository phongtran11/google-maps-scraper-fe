import type { Route } from "./+types/api.businesses.$id.notes";
import { pool } from "~/lib/db.server";
import { requireAuth } from "~/lib/require-auth";
import { verifySameOrigin } from "~/lib/csrf.server";

const MAX_NOTE_LENGTH = 5000;

export async function loader({ request, params }: Route.LoaderArgs) {
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

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  verifySameOrigin(request);

  const session = await requireAuth(request);

  const formData = await request.formData();
  const content = formData.get("content")?.toString()?.trim();

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  if (content.length > MAX_NOTE_LENGTH) {
    return new Response("Content is too long", { status: 400 });
  }

  const businessCheck = await pool.query(
    `SELECT 1 FROM businesses WHERE id = $1`,
    [params.id],
  );

  if (businessCheck.rows.length === 0) {
    return new Response("Business not found", { status: 404 });
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

  return { notes: notes.rows };
}
