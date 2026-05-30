import type { businessNotes } from "~/server/database/schema.server";

export type NoteRow = typeof businessNotes.$inferSelect;
