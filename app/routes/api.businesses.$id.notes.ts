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
  try {
    if (!params.id) {
      return { notes: [] };
    }
    const notes = await getBusinessNotes(params.id);
    return Response.json({ notes }, {
      status: 200,
      headers: { "Cache-Control": "private, max-age=10" },
    });
  } catch (err) {
    console.error("Notes loader error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error", notes: [] },
      { status: 500 },
    );
  }
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  validateMethod(request, ["POST", "PATCH", "DELETE"]);
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  const userEmail = session.user.email;

  if (!params.id) {
    return Response.json(
      {
        message: "Thiếu mã doanh nghiệp",
        code: "business_id_required",
        error: "business_id_required",
      },
      { status: 400 },
    );
  }

  try {
    const businessExists = await checkBusinessExists(params.id);
    if (!businessExists) {
      return Response.json(
        {
          message: "Không tìm thấy doanh nghiệp",
          code: "business_not_found",
          error: "business_not_found",
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
            message: "Nội dung không được để trống",
            code: "content_required",
            error: "content_required",
          },
          { status: 400 },
        );
      }

      if (content.length > MAX_NOTE_LENGTH) {
        return Response.json(
          {
            message: "Nội dung vượt quá độ dài cho phép",
            code: "content_too_long",
            error: "content_too_long",
          },
          { status: 400 },
        );
      }

      await createBusinessNote(params.id, content, userEmail);
      const notes = await getBusinessNotes(params.id);
      return Response.json(
        { notes, note: notes[0] },
        { headers: { "Cache-Control": "no-store" } },
      );
    } else if (method === "PATCH") {
      const noteId = formData.get("noteId")?.toString();
      const content = formData.get("content")?.toString()?.trim();

      if (!noteId) {
        return Response.json(
          {
            message: "Thiếu mã ghi chú",
            code: "note_id_required",
            error: "note_id_required",
          },
          { status: 400 },
        );
      }

      if (!content) {
        return Response.json(
          {
            message: "Nội dung không được để trống",
            code: "content_required",
            error: "content_required",
          },
          { status: 400 },
        );
      }

      if (content.length > MAX_NOTE_LENGTH) {
        return Response.json(
          {
            message: "Nội dung vượt quá độ dài cho phép",
            code: "content_too_long",
            error: "content_too_long",
          },
          { status: 400 },
        );
      }

      const note = await getBusinessNote(noteId);
      if (!note) {
        return Response.json(
          {
            message: "Không tìm thấy ghi chú",
            code: "note_not_found",
            error: "note_not_found",
          },
          { status: 404 },
        );
      }

      if (note.created_by !== userEmail) {
        return Response.json(
          {
            message: "Bạn không có quyền thực hiện hành động này",
            code: "permission_denied",
            error: "permission_denied",
          },
          { status: 403 },
        );
      }

      await updateBusinessNote(noteId, content);
      return Response.json(
        { success: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    } else if (method === "DELETE") {
      const noteId = formData.get("noteId")?.toString();

      if (!noteId) {
        return Response.json(
          {
            message: "Thiếu mã ghi chú",
            code: "note_id_required",
            error: "note_id_required",
          },
          { status: 400 },
        );
      }

      const note = await getBusinessNote(noteId);
      if (!note) {
        return Response.json(
          {
            message: "Không tìm thấy ghi chú",
            code: "note_not_found",
            error: "note_not_found",
          },
          { status: 404 },
        );
      }

      if (note.created_by !== userEmail) {
        return Response.json(
          {
            message: "Bạn không có quyền thực hiện hành động này",
            code: "permission_denied",
            error: "permission_denied",
          },
          { status: 403 },
        );
      }

      await deleteBusinessNote(noteId);
      return Response.json(
        { success: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (err) {
    console.error("Notes action error:", err);
    return Response.json(
      { message: "Lỗi máy chủ. Vui lòng thử lại sau.", error: "server_error" },
      { status: 500 },
    );
  }
}
