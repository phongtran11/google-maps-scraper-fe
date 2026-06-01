import { useFetcher } from "react-router";

import { ROUTES } from "~/shared/constants";

import type { NoteRow } from "../types";

interface UseNotesManagerOptions {
  businessId: number;
  initialNotes: NoteRow[];
}

export function useNotesManager({ businessId, initialNotes }: UseNotesManagerOptions) {
  const noteFetcher = useFetcher<{ notes?: NoteRow[]; error?: string; message?: string }>();

  const notes = noteFetcher.data?.notes ?? initialNotes;

  return {
    notes,
    noteFetcher,
    isSubmitting: noteFetcher.state === "submitting",
    action: ROUTES.api.businessNotes.buildPath(businessId),
  };
}
