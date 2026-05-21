import { useRef } from "react";
import { useFetcher } from "react-router";
import type { NoteRow } from "~/lib/types";

interface UseNotesManagerOptions {
  businessId: number;
  initialNotes: NoteRow[];
}

export function useNotesManager({ businessId, initialNotes }: UseNotesManagerOptions) {
  const noteFetcher = useFetcher<{ notes: NoteRow[] }>();
  const formRef = useRef<HTMLFormElement>(null);

  const notes = noteFetcher.data?.notes ?? initialNotes;

  const handleSubmit = () => {
    setTimeout(() => formRef.current?.reset(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return {
    notes,
    formRef,
    isSubmitting: noteFetcher.state === "submitting",
    action: `/api/businesses/${businessId}/notes`,
    handleSubmit,
    handleKeyDown,
  };
}
