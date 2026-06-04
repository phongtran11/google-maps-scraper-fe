import { useRouteLoaderData } from "react-router";

import type { AppLayoutData } from "~/shared/types";

import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";

import type { GetBusinessNotesResult } from "../../../queries.server";

import { useNotesManager } from "../../../hooks/use-notes-manager";
import { NoteInput } from "./note-input";
import { NoteItem } from "./note-item";

interface NotesSectionProps {
  businessId: number;
  initialNotes: GetBusinessNotesResult[];
}

export function NotesSection({ businessId, initialNotes }: NotesSectionProps) {
  const { action, isSubmitting, noteFetcher, notes } = useNotesManager({
    businessId,
    initialNotes,
  });

  const appLayoutData = useRouteLoaderData<AppLayoutData>("routes/app-layout");
  const currentUserEmail = appLayoutData?.user?.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ghi Chú</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoteInput action={action} isSubmitting={isSubmitting} noteFetcher={noteFetcher} />

        {noteFetcher.data?.error && (
          <p className="text-destructive text-sm">
            Lỗi: {noteFetcher.data.message || "Đã xảy ra lỗi"}
          </p>
        )}

        {notes.length > 0 && (
          <div className="space-y-3 pt-2">
            {notes.map((n) => (
              <NoteItem
                action={action}
                currentUserEmail={currentUserEmail}
                key={n.id}
                note={n}
                noteFetcher={noteFetcher}
              />
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">Chưa có ghi chú nào.</p>
        )}
      </CardContent>
    </Card>
  );
}
