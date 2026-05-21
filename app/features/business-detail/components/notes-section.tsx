import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/card";
import { relativeTime } from "~/lib/format";
import { useNotesManager } from "../hooks/useNotesManager";
import type { NoteRow } from "~/lib/types";

interface NotesSectionProps {
  businessId: number;
  initialNotes: NoteRow[];
}

export function NotesSection({ businessId, initialNotes }: NotesSectionProps) {
  const { notes, formRef, isSubmitting, action, handleSubmit, handleKeyDown } =
    useNotesManager({ businessId, initialNotes });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ghi Chú</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          ref={formRef}
          method="post"
          action={action}
          onSubmit={handleSubmit}
        >
          <textarea
            name="content"
            rows={3}
            placeholder="Nhập ghi chú..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-md h-9 px-4 text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm ghi chú"}
          </button>
        </form>

        {notes.length > 0 && (
          <div className="space-y-3 pt-2">
            {notes.map((n) => (
              <div key={n.id} className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{n.created_by}</span>
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(n.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có ghi chú nào.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
