import { useState, useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/card";
import { relativeTime } from "~/lib/format";
import { useNotesManager } from "../hooks/useNotesManager";
import type { NoteRow } from "~/lib/types";
import { Button, Textarea } from "~/shared/components";

interface NotesSectionProps {
  businessId: number;
  initialNotes: NoteRow[];
}

interface NoteInputProps {
  noteFetcher: any;
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
        onKeyDown={handleKeyDown}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
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
  noteFetcher: any;
  action: string;
}

function NoteItem({
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
    noteFetcher.submit(
      { noteId: String(note.id) },
      { method: "delete", action },
    );
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative group rounded-md border bg-muted/30 p-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {note.created_by}
          </span>
          <span className="text-xs text-muted-foreground">
            {relativeTime(note.created_at)}
          </span>
        </div>

        {isCreator && !isEditing && !showDeleteConfirm && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
              type="button"
            >
              Sửa
            </button>
            <span className="text-muted-foreground/40 text-[10px]">•</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] font-medium text-destructive hover:underline cursor-pointer"
              type="button"
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="space-y-2 mt-1">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full text-sm resize-none"
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="h-7 px-2.5 text-xs rounded"
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
              className="h-7 px-2.5 text-xs rounded"
              disabled={
                !editContent.trim() || editContent.trim() === note.content
              }
            >
              Lưu
            </Button>
          </div>
        </form>
      ) : showDeleteConfirm ? (
        <div className="flex flex-col gap-2 p-2 border border-destructive/20 rounded bg-destructive/5 mt-1">
          <p className="text-xs text-destructive font-medium">
            Bạn chắc chắn muốn xóa ghi chú này?
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              className="h-7 px-2.5 text-xs rounded"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              variant="destructive"
              type="button"
              className="h-7 px-2.5 text-xs rounded"
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {note.content}
        </p>
      )}
    </div>
  );
}

export function NotesSection({ businessId, initialNotes }: NotesSectionProps) {
  const { noteFetcher, notes, isSubmitting, action } = useNotesManager({
    businessId,
    initialNotes,
  });

  const appLayoutData = useRouteLoaderData<any>("routes/app-layout");
  const currentUserEmail = appLayoutData?.user?.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ghi Chú</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NoteInput
          noteFetcher={noteFetcher}
          action={action}
          isSubmitting={isSubmitting}
        />

        {noteFetcher.data?.error && (
          <p className="text-sm text-destructive">
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
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có ghi chú nào.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
