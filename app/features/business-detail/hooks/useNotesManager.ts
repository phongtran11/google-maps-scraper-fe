import { useFetcher } from "react-router";
import type { NoteRow } from "~/lib/types";
import { ROUTES } from "~/lib/routes";

interface UseNotesManagerOptions {
  businessId: number;
  initialNotes: NoteRow[];
}

export function useNotesManager({
  businessId,
  initialNotes,
}: UseNotesManagerOptions) {
  const noteFetcher = useFetcher<{ notes: NoteRow[] }>();

  const notes = noteFetcher.data?.notes ?? initialNotes;

  return {
    notes,
    noteFetcher,
    isSubmitting: noteFetcher.state === "submitting",
    action: ROUTES.api.businessNotes.buildPath(businessId),
  };
}

