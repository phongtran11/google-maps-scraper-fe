import { eq } from "drizzle-orm";

import { db } from "~/server/database/db.server";
import { businessNotes, businesses } from "~/server/database/schema.server";
import { parseId } from "~/shared/utils";

export async function createBusinessNote(
  businessId: string | number,
  content: string,
  createdBy: string,
): Promise<void> {
  const id = parseId(businessId);
  if (id === null) throw new Error("Invalid ID");
  await db.insert(businessNotes).values({
    business_id: id,
    content,
    created_by: createdBy,
  });
}

export async function updateBusinessNote(noteId: string | number, content: string): Promise<void> {
  const id = parseId(noteId);
  if (id === null) throw new Error("Invalid ID");
  await db.update(businessNotes).set({ content }).where(eq(businessNotes.id, id));
}

export async function deleteBusinessNote(noteId: string | number): Promise<void> {
  const id = parseId(noteId);
  if (id === null) throw new Error("Invalid ID");
  await db.update(businessNotes).set({ deleted_at: new Date() }).where(eq(businessNotes.id, id));
}

export async function updateBusinessStatus(id: string | number, status: string) {
  const numId = parseId(id);
  if (numId === null) throw new Error("Invalid ID");

  const result = await db
    .update(businesses)
    .set({ status })
    .where(eq(businesses.id, numId))
    .returning({ status: businesses.status });

  return result[0];
}
