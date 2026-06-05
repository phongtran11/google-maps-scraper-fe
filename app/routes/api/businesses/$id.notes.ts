import { z } from "zod";
import { zfd } from "zod-form-data";

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
import { apiError, apiNotFound, apiServerError, apiSuccess } from "~/server/http/responses.server";
import { parseId } from "~/shared/utils";

import type { Route } from "./+types/$id.notes";

const MAX_NOTE_LENGTH = 5000;

const DeleteNoteSchema = zfd.formData({
  noteId: zfd.numeric(z.number({ message: "Thiếu mã ghi chú" })),
});

const PatchNoteSchema = zfd.formData({
  noteId: zfd.numeric(z.number({ message: "Thiếu mã ghi chú" })),
  content: zfd.text(
    z
      .string({ message: "Nội dung không được để trống" })
      .min(1, "Nội dung không được để trống")
      .max(MAX_NOTE_LENGTH, "Nội dung vượt quá độ dài cho phép"),
  ),
});

const PostNoteSchema = zfd.formData({
  content: zfd.text(
    z
      .string({ message: "Nội dung không được để trống" })
      .min(1, "Nội dung không được để trống")
      .max(MAX_NOTE_LENGTH, "Nội dung vượt quá độ dài cho phép"),
  ),
});

export async function action({ context, params, request }: Route.ActionArgs) {
  validateMethod(request, ["POST", "PATCH", "DELETE"]);
  verifySameOrigin(request);

  const session = context.get(sessionContext)!;
  const userEmail = session.user.email;
  const businessId = parseId(params.id);

  if (!businessId) {
    return apiError("business_id_required", "Thiếu mã doanh nghiệp");
  }

  try {
    const businessExists = await checkBusinessExists(businessId);
    if (!businessExists) {
      return apiNotFound("Không tìm thấy doanh nghiệp");
    }

    const method = request.method.toUpperCase();
    const formData = await request.formData();

    switch (method) {
      case "DELETE":
        return await handleDelete(userEmail, formData);
      case "PATCH":
        return await handlePatch(userEmail, formData);
      case "POST":
        return await handlePost(businessId, userEmail, formData);
      default:
        return apiServerError(); // Should be caught by validateMethod anyway
    }
  } catch (err) {
    console.error("Notes action error:", err);
    return apiServerError();
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const businessId = parseId(params.id);
    if (!businessId) {
      return { notes: [] };
    }
    const notes = await getBusinessNotes(businessId);
    return apiSuccess(notes, "success", { headers: { "Cache-Control": "private, max-age=10" } });
  } catch (err) {
    console.error("Notes loader error:", err);
    return apiServerError("Lỗi máy chủ. Vui lòng thử lại sau.", "server_error");
  }
}

async function handleDelete(userEmail: string, formData: FormData) {
  const parsed = DeleteNoteSchema.safeParse(formData);

  if (!parsed.success) {
    return apiError("note_id_required", parsed.error.issues[0].message);
  }

  const { noteId } = parsed.data;

  const note = await getBusinessNote(noteId);
  if (!note) {
    return apiNotFound("Không tìm thấy ghi chú");
  }

  if (note.createdBy !== userEmail) {
    return apiError("permission_denied", "Bạn không có quyền thực hiện hành động này", 403);
  }

  await deleteBusinessNote(noteId);
  return apiSuccess({ success: true }, "success", { headers: { "Cache-Control": "no-store" } });
}

async function handlePatch(userEmail: string, formData: FormData) {
  const parsed = PatchNoteSchema.safeParse(formData);

  if (!parsed.success) {
    return apiError("invalid_data", parsed.error.issues[0].message);
  }

  const { content, noteId } = parsed.data;

  const note = await getBusinessNote(noteId);
  if (!note) {
    return apiNotFound("Không tìm thấy ghi chú");
  }

  if (note.createdBy !== userEmail) {
    return apiError("permission_denied", "Bạn không có quyền thực hiện hành động này", 403);
  }

  await updateBusinessNote(noteId, content);
  return apiSuccess({ success: true }, "success", { headers: { "Cache-Control": "no-store" } });
}

async function handlePost(businessId: number, userEmail: string, formData: FormData) {
  const parsed = PostNoteSchema.safeParse(formData);

  if (!parsed.success) {
    return apiError("invalid_data", parsed.error.issues[0].message);
  }

  const { content } = parsed.data;

  await createBusinessNote(businessId, content, userEmail);
  const notes = await getBusinessNotes(businessId);
  return apiSuccess({ note: notes[0], notes }, "success", {
    headers: { "Cache-Control": "no-store" },
  });
}
