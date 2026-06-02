import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/shared/components/molecules/dialog";

beforeEach(() => {
  document.body.style.overflow = "";
});

describe("Dialog", () => {
  it("returns null when closed", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
          <DialogBody>Nội dung</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Tiêu đề")).toBeInTheDocument();
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
  });

  it("closes on backdrop click", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const backdrop = screen
      .getByText("Tiêu đề")
      .closest(".fixed.inset-0")
      ?.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      await user.click(backdrop);
    }
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape key", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("locks body scroll when open", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll on close", () => {
    const { rerender } = render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Dialog onOpenChange={vi.fn()} open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("has correct ARIA attributes", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
            <DialogDescription>Mô tả</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(dialog.getAttribute("aria-labelledby")).not.toBe("");
    expect(dialog.getAttribute("aria-describedby")).not.toBe("");
  });

  it("links title and description IDs to dialog", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
            <DialogDescription>Mô tả</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("Tiêu đề");
    const description = screen.getByText("Mô tả");

    expect(title.id).toBe(dialog.getAttribute("aria-labelledby"));
    expect(description.id).toBe(dialog.getAttribute("aria-describedby"));
  });

  it("renders different content sizes", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent size="sm">Nội dung sm</DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Nội dung sm").className).toContain("max-w-sm");
  });

  it("renders xl size", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent size="xl">Nội dung xl</DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Nội dung xl").className).toContain("max-w-xl");
  });

  it("renders fullscreen size", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent size="fullscreen">Nội dung full</DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Nội dung full").className).toContain("max-w-full");
  });

  it("renders DialogFooter with children", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogFooter>
            <button>Đóng</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Đóng")).toBeInTheDocument();
  });

  it("focus trap: Tab at last focusable wraps to first", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
          <input data-testid="first" placeholder="Đầu tiên" />
          <input data-testid="last" placeholder="Cuối cùng" />
        </DialogContent>
      </Dialog>,
    );
    const last = screen.getByTestId("last");
    const first = screen.getByTestId("first");
    last.focus();
    fireEvent.keyDown(document, { bubbles: true, key: "Tab" });
    expect(document.activeElement).toBe(first);
  });

  it("focus trap: Shift+Tab at first focusable wraps to last", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
          <input data-testid="first" placeholder="Đầu tiên" />
          <input data-testid="last" placeholder="Cuối cùng" />
        </DialogContent>
      </Dialog>,
    );
    const first = screen.getByTestId("first");
    const last = screen.getByTestId("last");
    first.focus();
    fireEvent.keyDown(document, { bubbles: true, key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("handles dialog with no focusable children", () => {
    render(
      <Dialog onOpenChange={vi.fn()} open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiêu đề</DialogTitle>
          </DialogHeader>
          <DialogBody>Nội dung không có nút</DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
