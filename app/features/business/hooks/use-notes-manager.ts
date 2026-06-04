import { useFetcher } from "react-router";

import { ROUTES } from "~/shared/constants";

import type { GetBusinessNotesResult, NoteFetcherData } from "../queries.server";

interface UseNotesManagerOptions {
  businessId: number;
  initialNotes: GetBusinessNotesResult[];
}

export function useNotesManager({ businessId, initialNotes }: UseNotesManagerOptions) {
  const noteFetcher = useFetcher<NoteFetcherData>();

  const notes = noteFetcher.data?.notes ?? initialNotes;

  return {
    action: ROUTES.api.businessNotes.buildPath(businessId),
    isSubmitting: noteFetcher.state === "submitting",
    noteFetcher,
    notes,
  };
}
