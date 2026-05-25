import { sql } from "./db.server";
import type { NoteRow } from "../../types";

export async function getBusinessNotes(
  businessId: string | number,
): Promise<NoteRow[]> {
  const result = await sql.query(
    `SELECT id, content, created_by, created_at
     FROM business_notes
     WHERE business_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [businessId],
  );
  return result as NoteRow[];
}

export async function getBusinessNote(
  noteId: string | number,
): Promise<NoteRow | null> {
  const result = await sql.query(
    `SELECT * FROM business_notes WHERE id = $1 AND deleted_at IS NULL`,
    [noteId],
  );
  return result.length > 0 ? (result[0] as NoteRow) : null;
}

export async function createBusinessNote(
  businessId: string | number,
  content: string,
  createdBy: string,
): Promise<void> {
  await sql.query(
    `INSERT INTO business_notes (business_id, content, created_by)
     VALUES ($1, $2, $3)`,
    [businessId, content, createdBy],
  );
}

export async function updateBusinessNote(
  noteId: string | number,
  content: string,
): Promise<void> {
  await sql.query(`UPDATE business_notes SET content = $1 WHERE id = $2`, [
    content,
    noteId,
  ]);
}

export async function deleteBusinessNote(
  noteId: string | number,
): Promise<void> {
  await sql.query(
    `UPDATE business_notes SET deleted_at = NOW() WHERE id = $1`,
    [noteId],
  );
}
