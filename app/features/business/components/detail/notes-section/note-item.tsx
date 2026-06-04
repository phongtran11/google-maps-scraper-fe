import type { useFetcher } from "react-router";

import { memo, useEffect, useState } from "react";

import { Button, Textarea } from "~/shared/components";
import { relativeTime } from "~/shared/utils";

import type { GetBusinessNotesResult, NoteFetcherData } from "../../../queries.server";

interface NoteItemProps {
  action: string;
  currentUserEmail: string | undefined;
  note: GetBusinessNotesResult;
  noteFetcher: ReturnType<typeof useFetcher<NoteFetcherData>>;
}

export const NoteItem = memo(function NoteItem({
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
