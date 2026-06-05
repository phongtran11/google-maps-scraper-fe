import { useFetcher } from "react-router";

import type { ApiResponse } from "~/server/http/responses.server";

import { ROUTES } from "~/shared/constants";

import type { GetBusinessNotesResult } from "../queries.server";

export type NoteFetcherData = ApiResponse<{
  note?: GetBusinessNotesResult;
  notes?: GetBusinessNotesResult[];
  success?: boolean;
}>;

type UseNotesManagerOptions = {
  businessId: number;
  initialNotes: GetBusinessNotesResult[];
};

export function useNotesManager({ businessId, initialNotes }: UseNotesManagerOptions) {
  const noteFetcher = useFetcher<NoteFetcherData>();

  const notes = noteFetcher.data?.data?.notes ?? initialNotes;

  return {
    action: ROUTES.api.businessNotes.buildPath(businessId),
    isSubmitting: noteFetcher.state === "submitting",
    noteFetcher,
    notes,
  };
}
