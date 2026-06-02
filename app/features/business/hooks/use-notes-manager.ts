import { useFetcher } from "react-router";

import { ROUTES } from "~/shared/constants";

import type { NoteRow } from "../types";

interface UseNotesManagerOptions {
  businessId: number;
  initialNotes: NoteRow[];
}

export function useNotesManager({ businessId, initialNotes }: UseNotesManagerOptions) {
  const noteFetcher = useFetcher<{ error?: string; message?: string; notes?: NoteRow[] }>();

  const notes = noteFetcher.data?.notes ?? initialNotes;

  return {
    action: ROUTES.api.businessNotes.buildPath(businessId),
    isSubmitting: noteFetcher.state === "submitting",
    noteFetcher,
    notes,
  };
}
