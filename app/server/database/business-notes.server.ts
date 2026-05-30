import { db } from "./db.server";
import { businessNotes } from "./schema.server";
import { eq, and, isNull, desc } from "drizzle-orm";
import type { NoteRow } from "~/shared/types";

function parseId(id: string | number): number {
  const num = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(num)) throw new Error("Invalid ID");
  return num;
}

export async function getBusinessNotes(
  businessId: string | number,
  limit = 50,
  offset = 0,
): Promise<NoteRow[]> {
  const id = parseId(businessId);

  const result = await db
    .select({
      id: businessNotes.id,
      content: businessNotes.content,
      created_by: businessNotes.created_by,
      created_at: businessNotes.created_at,
    })
    .from(businessNotes)
    .where(and(eq(businessNotes.business_id, id), isNull(businessNotes.deleted_at)))
    .orderBy(desc(businessNotes.created_at))
    .limit(limit)
    .offset(offset);

  return result as unknown as NoteRow[];
}

export async function getBusinessNote(noteId: string | number): Promise<NoteRow | null> {
  const id = parseId(noteId);
  const result = await db
    .select()
    .from(businessNotes)
    .where(and(eq(businessNotes.id, id), isNull(businessNotes.deleted_at)))
    .limit(1);

  return result.length > 0 ? (result[0] as unknown as NoteRow) : null;
}

export async function createBusinessNote(
  businessId: string | number,
  content: string,
  createdBy: string,
): Promise<void> {
  const id = parseId(businessId);
  await db.insert(businessNotes).values({
    business_id: id,
    content,
    created_by: createdBy,
  });
}

export async function updateBusinessNote(noteId: string | number, content: string): Promise<void> {
  const id = parseId(noteId);
  await db.update(businessNotes).set({ content }).where(eq(businessNotes.id, id));
}

export async function deleteBusinessNote(noteId: string | number): Promise<void> {
  const id = parseId(noteId);
  await db.update(businessNotes).set({ deleted_at: new Date() }).where(eq(businessNotes.id, id));
}
