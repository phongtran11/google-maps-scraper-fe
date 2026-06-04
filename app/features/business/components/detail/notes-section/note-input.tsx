import type { useFetcher } from "react-router";

import { useEffect, useState } from "react";

import { Button, Textarea } from "~/shared/components";

import type { NoteFetcherData } from "../../../queries.server";

interface NoteInputProps {
  action: string;
  isSubmitting: boolean;
  noteFetcher: ReturnType<typeof useFetcher<NoteFetcherData>>;
}

export function NoteInput({ action, isSubmitting, noteFetcher }: NoteInputProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (noteFetcher.state === "idle" && noteFetcher.data) {
      setContent(""); // eslint-disable-line react-hooks/set-state-in-effect
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
