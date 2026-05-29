import { businesses, businessNotes } from "./server/database/schema";

export type BusinessRow = typeof businesses.$inferSelect;

export type NoteRow = typeof businessNotes.$inferSelect;
