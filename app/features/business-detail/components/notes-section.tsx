import { memo, useState, useEffect } from "react";
import { useRouteLoaderData, useFetcher } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components/card";
import { relativeTime } from "~/shared/utils";
import { useNotesManager } from "../hooks/useNotesManager";
import type { NoteRow } from "~/shared/types";
import { Button, Textarea } from "~/shared/components";

interface NotesSectionProps {
  businessId: number;
  initialNotes: NoteRow[];
}

interface NoteInputProps {
  noteFetcher: ReturnType<typeof useFetcher>;
  action: string;
  isSubmitting: boolean;
}

function NoteInput({ noteFetcher, action, isSubmitting }: NoteInputProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (noteFetcher.state === "idle" && noteFetcher.data) {
      setContent("");
    }
  }, [noteFetcher.state, noteFetcher.data]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        noteFetcher.submit(e.currentTarget.form);
      }
    }
  };

  return (
    <noteFetcher.Form method="post" action={action}>
      <Textarea
        name="content"
        rows={3}
        placeholder="Nhập ghi chú..."
        className="resize-none"
        maxLength={5000}
        onKeyDown={handleKeyDown}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {content.length > 4500 && (
        <span className="text-muted-foreground text-xs">{5000 - content.length} ký tự còn lại</span>
      )}
      <Button
        loading={isSubmitting}
        disabled={!content.trim() || isSubmitting}
        type="submit"
        className="mt-5"
        size="sm"
      >
        Thêm ghi chú
      </Button>
    </noteFetcher.Form>
  );
}

interface NoteItemProps {
  note: NoteRow;
  currentUserEmail: string | undefined;
  noteFetcher: ReturnType<typeof useFetcher>;
  action: string;
}

const NoteItem = memo(function NoteItem({
  note,
  currentUserEmail,
  noteFetcher,
  action,
}: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditContent(note.content);
  }, [note.content]);

  const isCreator = currentUserEmail && note.created_by === currentUserEmail;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && editContent.trim() !== note.content) {
      noteFetcher.submit(
        {
          noteId: String(note.id),
          content: editContent.trim(),
        },
        { method: "patch", action },
      );
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editContent.trim()) {
        handleEditSubmit(e);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(note.content);
    }
  };

  const handleDelete = () => {
    noteFetcher.submit({ noteId: String(note.id) }, { method: "delete", action });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="group bg-muted/30 hover:bg-muted/40 relative rounded-md border p-3 transition-colors">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xs font-semibold">{note.created_by}</span>
          <span className="text-muted-foreground text-xs">{relativeTime(note.created_at)}</span>
        </div>

        {isCreator && !isEditing && !showDeleteConfirm && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary cursor-pointer text-[11px] font-medium hover:underline"
              type="button"
            >
              Sửa
            </button>
            <span className="text-muted-foreground/40 text-[10px]">•</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive cursor-pointer text-[11px] font-medium hover:underline"
              type="button"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mt-1 space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full resize-none text-sm"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="h-7 rounded px-2.5 text-xs"
              onClick={() => {
                setIsEditing(false);
                setEditContent(note.content);
              }}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              type="submit"
              className="h-7 rounded px-2.5 text-xs"
              disabled={!editContent.trim() || editContent.trim() === note.content}
            >
              Lưu
            </Button>
          </div>
        </form>
      ) : showDeleteConfirm ? (
        <div className="border-destructive/20 bg-destructive/5 mt-1 flex flex-col gap-2 rounded border p-2">
          <p className="text-destructive text-xs font-medium">
            Bạn chắc chắn muốn xóa ghi chú này?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 rounded px-2.5 text-xs"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              variant="destructive"
              type="button"
              className="h-7 rounded px-2.5 text-xs"
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
      )}
    </div>
  );
});

export function NotesSection({ businessId, initialNotes }: NotesSectionProps) {
  const { noteFetcher, notes, isSubmitting, action } = useNotesManager({
    businessId,
    initialNotes,
  });

  type AppLayoutData = { user: { name: string; email: string; image?: string | null } };
  const appLayoutData = useRouteLoaderData<AppLayoutData>("routes/app-layout");
  const currentUserEmail = appLayoutData?.user?.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ghi Chú</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoteInput noteFetcher={noteFetcher} action={action} isSubmitting={isSubmitting} />

        {noteFetcher.data?.error && (
          <p className="text-destructive text-sm">
            Lỗi: {noteFetcher.data.message || "Đã xảy ra lỗi"}
          </p>
        )}

        {notes.length > 0 && (
          <div className="space-y-3 pt-2">
            {notes.map((n) => (
              <NoteItem
                key={n.id}
                note={n}
                currentUserEmail={currentUserEmail}
                noteFetcher={noteFetcher}
                action={action}
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
