import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import {
  createBusinessNote,
  deleteBusinessNote,
  updateBusinessNote,
} from "~/features/business/mutations.server";
import {
  checkBusinessExists,
  getBusinessNote,
  getBusinessNotes,
} from "~/features/business/queries.server";
import { sessionContext } from "~/server/auth/require-auth.server";
import { verifySameOrigin } from "~/server/http/csrf.server";
import { validateMethod } from "~/server/http/request.server";

const MAX_NOTE_LENGTH = 5000;

export async function action({ context, params, request }: ActionFunctionArgs) {
  validateMethod(request, ["POST", "PATCH", "DELETE"]);
  verifySameOrigin(request);

  const session = context.get(sessionContext);
  const userEmail = session.user.email;

  if (!params.id) {
    return Response.json(
      {
        code: "business_id_required",
        error: "business_id_required",
        message: "Thiếu mã doanh nghiệp",
      },
      { status: 400 },
    );
  }

  try {
    const businessExists = await checkBusinessExists(params.id);
    if (!businessExists) {
      return Response.json(
        {
          code: "business_not_found",
          error: "business_not_found",
          message: "Không tìm thấy doanh nghiệp",
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
            code: "content_required",
            error: "content_required",
            message: "Nội dung không được để trống",
          },
          { status: 400 },
        );
      }

      if (content.length > MAX_NOTE_LENGTH) {
        return Response.json(
          {
            code: "content_too_long",
            error: "content_too_long",
            message: "Nội dung vượt quá độ dài cho phép",
          },
          { status: 400 },
        );
      }

      await createBusinessNote(params.id, content, userEmail);
      const notes = await getBusinessNotes(params.id);
      return Response.json({ note: notes[0], notes }, { headers: { "Cache-Control": "no-store" } });
    } else if (method === "PATCH") {
      const noteId = formData.get("noteId")?.toString();
      const content = formData.get("content")?.toString()?.trim();

      if (!noteId) {
        return Response.json(
          {
            code: "note_id_required",
            error: "note_id_required",
            message: "Thiếu mã ghi chú",
          },
          { status: 400 },
        );
      }

      if (!content) {
        return Response.json(
          {
            code: "content_required",
            error: "content_required",
            message: "Nội dung không được để trống",
          },
          { status: 400 },
        );
      }

      if (content.length > MAX_NOTE_LENGTH) {
        return Response.json(
          {
            code: "content_too_long",
            error: "content_too_long",
            message: "Nội dung vượt quá độ dài cho phép",
          },
          { status: 400 },
        );
      }

      const note = await getBusinessNote(noteId);
      if (!note) {
        return Response.json(
          {
            code: "note_not_found",
            error: "note_not_found",
            message: "Không tìm thấy ghi chú",
          },
          { status: 404 },
        );
      }

      if (note.createdBy !== userEmail) {
        return Response.json(
          {
            code: "permission_denied",
            error: "permission_denied",
            message: "Bạn không có quyền thực hiện hành động này",
          },
          { status: 403 },
        );
      }

      await updateBusinessNote(noteId, content);
      return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    } else if (method === "DELETE") {
      const noteId = formData.get("noteId")?.toString();

      if (!noteId) {
        return Response.json(
          {
            code: "note_id_required",
            error: "note_id_required",
            message: "Thiếu mã ghi chú",
          },
          { status: 400 },
        );
      }

      const note = await getBusinessNote(noteId);
      if (!note) {
        return Response.json(
          {
            code: "note_not_found",
            error: "note_not_found",
            message: "Không tìm thấy ghi chú",
          },
          { status: 404 },
        );
      }

      if (note.createdBy !== userEmail) {
        return Response.json(
          {
            code: "permission_denied",
            error: "permission_denied",
            message: "Bạn không có quyền thực hiện hành động này",
          },
          { status: 403 },
        );
      }

      await deleteBusinessNote(noteId);
      return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    }
  } catch (err) {
    console.error("Notes action error:", err);
    return Response.json(
      { error: "server_error", message: "Lỗi máy chủ. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    if (!params.id) {
      return { notes: [] };
    }
    const notes = await getBusinessNotes(params.id);
    return Response.json(
      { notes },
      {
        headers: { "Cache-Control": "private, max-age=10" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("Notes loader error:", err);
    return Response.json(
      { error: "server_error", message: "Lỗi máy chủ. Vui lòng thử lại sau.", notes: [] },
      { status: 500 },
    );
  }
}
