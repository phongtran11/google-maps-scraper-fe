import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { pool } from "~/lib/server/db.server";
import { sessionContext } from "~/lib/server/require-auth.server";
import { verifySameOrigin } from "~/lib/server/csrf.server";
import { validateMethod } from "~/lib/server/request.server";

const MAX_NOTE_LENGTH = 5000;

export async function loader({ params }: LoaderFunctionArgs) {
  const result = await pool.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [params.id],
  );

  return { notes: result.rows };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, ["POST", "PATCH", "DELETE"]);
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  const userEmail = session.user.email;

  const businessCheck = await pool.query(
    `SELECT 1 FROM businesses WHERE id = $1`,
    [params.id],
  );

  if (businessCheck.rows.length === 0) {
    return Response.json(
      {
        message: "Business not found",
        code: "business_not_found",
        error: "business not found",
      },
      { status: 404 },
    );
  }

  const method = request.method.toUpperCase();
  const formData = await request.formData();

  if (method === "POST") {
    const content = formData.get("content")?.toString()?.trim();

    if (!content) {
      return Response.json(
        {
          message: "Content is required",
          code: "content_required",
          error: "content is required",
        },
        { status: 400 },
      );
    }

    if (content.length > MAX_NOTE_LENGTH) {
      return Response.json(
        {
          message: "Content is too long",
          code: "content_too_long",
          error: "content too long",
        },
        { status: 400 },
      );
    }

    await pool.query(
      `INSERT INTO business_notes (business_id, content, created_by)
       VALUES ($1, $2, $3)`,
      [params.id, content, userEmail],
    );
  } else if (method === "PATCH") {
    const noteId = formData.get("noteId")?.toString();
    const content = formData.get("content")?.toString()?.trim();

    if (!noteId) {
      return Response.json(
        {
          message: "Note ID is required",
          code: "note_id_required",
          error: "noteId is required for update",
        },
        { status: 400 },
      );
    }

    if (!content) {
      return Response.json(
        {
          message: "Content is required",
          code: "content_required",
          error: "content is required",
        },
        { status: 400 },
      );
    }

    if (content.length > MAX_NOTE_LENGTH) {
      return Response.json(
        {
          message: "Content is too long",
          code: "content_too_long",
          error: "content too long",
        },
        { status: 400 },
      );
    }

    // Check ownership
    const noteCheck = await pool.query(
      `SELECT created_by FROM business_notes WHERE id = $1 AND deleted_at IS NULL`,
      [noteId],
    );

    if (noteCheck.rows.length === 0) {
      return Response.json(
        {
          message: "Note not found",
          code: "note_not_found",
          error: "note not found or already deleted",
        },
        { status: 404 },
      );
    }

    if (noteCheck.rows[0].created_by !== userEmail) {
      return Response.json(
        {
          message: "Permission denied",
          code: "permission_denied",
          error: "You can only edit your own notes",
        },
        { status: 403 },
      );
    }

    await pool.query(
      `UPDATE business_notes SET content = $1 WHERE id = $2`,
      [content, noteId],
    );
  } else if (method === "DELETE") {
    const noteId = formData.get("noteId")?.toString();

    if (!noteId) {
      return Response.json(
        {
          message: "Note ID is required",
          code: "note_id_required",
          error: "noteId is required for deletion",
        },
        { status: 400 },
      );
    }

    // Check ownership
    const noteCheck = await pool.query(
      `SELECT created_by FROM business_notes WHERE id = $1 AND deleted_at IS NULL`,
      [noteId],
    );

    if (noteCheck.rows.length === 0) {
      return Response.json(
        {
          message: "Note not found",
          code: "note_not_found",
          error: "note not found or already deleted",
        },
        { status: 404 },
      );
    }

    if (noteCheck.rows[0].created_by !== userEmail) {
      return Response.json(
        {
          message: "Permission denied",
          code: "permission_denied",
          error: "You can only delete your own notes",
        },
        { status: 403 },
      );
    }

    await pool.query(
      `UPDATE business_notes SET deleted_at = NOW() WHERE id = $1`,
      [noteId],
    );
  }

  const notes = await pool.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [params.id],
  );

  return Response.json({ notes: notes.rows });
}
