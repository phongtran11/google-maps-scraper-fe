import { memo, useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";

import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from "~/shared/components";
import { relativeTime } from "~/shared/utils";

import type { NoteRow } from "../../types";

import { useNotesManager } from "../../hooks/use-notes-manager";

interface NoteInputProps {
  action: string;
  isSubmitting: boolean;
  noteFetcher: ReturnType<typeof useFetcher>;
}

interface NoteItemProps {
  action: string;
  currentUserEmail: string | undefined;
  note: NoteRow;
  noteFetcher: ReturnType<typeof useFetcher>;
}

interface NotesSectionProps {
  businessId: number;
  initialNotes: NoteRow[];
}

function NoteInput({ action, isSubmitting, noteFetcher }: NoteInputProps) {
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
    <noteFetcher.Form action={action} method="post">
      <Textarea
        className="resize-none"
        maxLength={5000}
        name="content"
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập ghi chú..."
        rows={3}
        value={content}
      />
      {content.length > 4500 && (
        <span className="text-muted-foreground text-xs">{5000 - content.length} ký tự còn lại</span>
      )}
      <Button
        className="mt-5"
        disabled={!content.trim() || isSubmitting}
        loading={isSubmitting}
        size="sm"
        type="submit"
      >
        Thêm ghi chú
      </Button>
    </noteFetcher.Form>
  );
}

const NoteItem = memo(function NoteItem({
  action,
  currentUserEmail,
  note,
  noteFetcher,
}: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditContent(note.content);
  }, [note.content]);

  const isCreator = currentUserEmail && note.createdBy === currentUserEmail;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && editContent.trim() !== note.content) {
      noteFetcher.submit(
        {
          content: editContent.trim(),
          noteId: String(note.id),
        },
        { action, method: "patch" },
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
    noteFetcher.submit({ noteId: String(note.id) }, { action, method: "delete" });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="group bg-muted/30 hover:bg-muted/40 relative rounded-md border p-3 transition-colors">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-xs font-semibold">{note.createdBy}</span>
          <span className="text-muted-foreground text-xs">{relativeTime(note.createdAt)}</span>
        </div>

        {isCreator && !isEditing && !showDeleteConfirm && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              className="text-primary cursor-pointer text-[11px] font-medium hover:underline"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Sửa
            </button>
            <span className="text-muted-foreground/40 text-[10px]">•</span>
            <button
              className="text-destructive cursor-pointer text-[11px] font-medium hover:underline"
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form className="mt-1 space-y-2" onSubmit={handleEditSubmit}>
          <Textarea
            autoFocus
            className="w-full resize-none text-sm"
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            value={editContent}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              className="h-7 rounded px-2.5 text-xs"
              onClick={() => {
                setIsEditing(false);
                setEditContent(note.content);
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              className="h-7 rounded px-2.5 text-xs"
              disabled={!editContent.trim() || editContent.trim() === note.content}
              size="sm"
              type="submit"
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
              className="h-7 rounded px-2.5 text-xs"
              onClick={() => setShowDeleteConfirm(false)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Hủy
            </Button>
            <Button
              className="h-7 rounded px-2.5 text-xs"
              onClick={handleDelete}
              size="sm"
              type="button"
              variant="destructive"
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
  const { action, isSubmitting, noteFetcher, notes } = useNotesManager({
    businessId,
    initialNotes,
  });

  type AppLayoutData = { user: { email: string; image?: null | string; name: string } };
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
