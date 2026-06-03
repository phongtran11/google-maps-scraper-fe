import { eq } from "drizzle-orm";

import { db } from "~/server/database/db.server";
import { businesses, businessNotes } from "~/server/database/schema.server";
import { parseId } from "~/shared/utils";

export async function createBusinessNote(
  businessId: number | string,
  content: string,
  createdBy: string,
): Promise<void> {
  const id = parseId(businessId);
  if (id === null) throw new Error("Invalid ID");
  await db.insert(businessNotes).values({
    businessId: id,
    content,
    createdBy: createdBy,
  });
}

export async function deleteBusinessNote(noteId: number | string): Promise<void> {
  const id = parseId(noteId);
  if (id === null) throw new Error("Invalid ID");
  await db.update(businessNotes).set({ deletedAt: new Date() }).where(eq(businessNotes.id, id));
}

export async function updateBusinessNote(noteId: number | string, content: string): Promise<void> {
  const id = parseId(noteId);
  if (id === null) throw new Error("Invalid ID");
  await db.update(businessNotes).set({ content }).where(eq(businessNotes.id, id));
}

export async function updateBusinessStatus(id: number | string, status: string) {
  const numId = parseId(id);
  if (numId === null) throw new Error("Invalid ID");

  const result = await db
    .update(businesses)
    .set({ status })
    .where(eq(businesses.id, numId))
    .returning({ status: businesses.status });

  return result[0];
}
