import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { checkBusinessExists } from "~/lib/server/database/businesses.server";
import {
  getBusinessNotes,
  getBusinessNote,
  createBusinessNote,
  updateBusinessNote,
  deleteBusinessNote,
} from "~/lib/server/database/business-notes.server";
import { sessionContext } from "~/lib/server/require-auth.server";
import { verifySameOrigin } from "~/lib/server/csrf.server";
import { validateMethod } from "~/lib/server/request.server";

const MAX_NOTE_LENGTH = 5000;

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    return { notes: [] };
  }
  const notes = await getBusinessNotes(params.id);
  return { notes };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, ["POST", "PATCH", "DELETE"]);
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  const userEmail = session.user.email;

  if (!params.id) {
    return Response.json(
      {
        message: "Business ID is required",
        code: "business_id_required",
        error: "Business ID is required",
      },
      { status: 400 },
    );
  }

  const businessExists = await checkBusinessExists(params.id);
  if (!businessExists) {
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

    await createBusinessNote(params.id, content, userEmail);
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

    const note = await getBusinessNote(noteId);
    if (!note) {
      return Response.json(
        {
          message: "Note not found",
          code: "note_not_found",
          error: "note not found or already deleted",
        },
        { status: 404 },
      );
    }

    if (note.created_by !== userEmail) {
      return Response.json(
        {
          message: "Permission denied",
          code: "permission_denied",
          error: "You can only edit your own notes",
        },
        { status: 403 },
      );
    }

    await updateBusinessNote(noteId, content);
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

    const note = await getBusinessNote(noteId);
    if (!note) {
      return Response.json(
        {
          message: "Note not found",
          code: "note_not_found",
          error: "note not found or already deleted",
        },
        { status: 404 },
      );
    }

    if (note.created_by !== userEmail) {
      return Response.json(
        {
          message: "Permission denied",
          code: "permission_denied",
          error: "You can only delete your own notes",
        },
        { status: 403 },
      );
    }

    await deleteBusinessNote(noteId);
  }

  const notes = await getBusinessNotes(params.id);
  return Response.json({ notes });
}
