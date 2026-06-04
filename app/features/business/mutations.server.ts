import { eq } from "drizzle-orm";

import type { AwaitedReturn } from "~/shared/types";

import { db } from "~/server/database/db.server";
import { businesses, businessNotes } from "~/server/database/schema.server";

export type CreateBusinessNoteResult = AwaitedReturn<typeof createBusinessNote>;
export type UpdateBusinessNoteResult = AwaitedReturn<typeof updateBusinessNote>;
export type UpdateBusinessStatusResult = AwaitedReturn<typeof updateBusinessStatus>;

export async function createBusinessNote(businessId: number, content: string, createdBy: string) {
  const result = await db
    .insert(businessNotes)
    .values({
      businessId,
      content,
      createdBy: createdBy,
    })
    .returning({
      id: businessNotes.id,
      businessId: businessNotes.businessId,
      content: businessNotes.content,
      createdAt: businessNotes.createdAt,
      createdBy: businessNotes.createdBy,
      updatedAt: businessNotes.updatedAt,
    });

  return result[0];
}

export async function deleteBusinessNote(noteId: number): Promise<void> {
  await db.update(businessNotes).set({ deletedAt: new Date() }).where(eq(businessNotes.id, noteId));
}

export async function updateBusinessNote(noteId: number, content: string) {
  const result = await db
    .update(businessNotes)
    .set({ content })
    .where(eq(businessNotes.id, noteId))
    .returning({
      id: businessNotes.id,
      businessId: businessNotes.businessId,
      content: businessNotes.content,
      createdAt: businessNotes.createdAt,
      updatedAt: businessNotes.updatedAt,
    });
  return result[0];
}

export async function updateBusinessStatus(id: number, status: string) {
  const result = await db
    .update(businesses)
    .set({ status })
    .where(eq(businesses.id, id))
    .returning({
      id: businesses.id,
      status: businesses.status,
      updatedAt: businesses.updatedAt,
    });

  return result[0];
}
