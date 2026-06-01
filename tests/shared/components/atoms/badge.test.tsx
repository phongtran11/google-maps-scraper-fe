import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "~/shared/components/atoms/badge";

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>Mới</Badge>);
    expect(screen.getByText("Mới")).toBeInTheDocument();
  });

  it("applies default variant and size", () => {
    render(<Badge>Mới</Badge>);
    const badge = screen.getByText("Mới");
    expect(badge.className).toContain("bg-primary");
    expect(badge.className).toContain("px-2.5");
  });

  it("renders all variants", () => {
    const variants = [
      "default",
      "secondary",
      "destructive",
      "outline",
      "success",
      "warning",
      "info",
    ] as const;
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders all sizes", () => {
    const sizes = ["sm", "md", "lg"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Badge size={size}>{size}</Badge>);
      expect(screen.getByText(size)).toBeInTheDocument();
      unmount();
    }
  });

  it("applies sm size classes", () => {
    render(<Badge size="sm">Nhỏ</Badge>);
    expect(screen.getByText("Nhỏ").className).toContain("px-1.5");
  });

  it("applies lg size classes", () => {
    render(<Badge size="lg">Lớn</Badge>);
    expect(screen.getByText("Lớn").className).toContain("px-3");
  });

  it("merges custom className", () => {
    render(<Badge className="custom-badge">Tag</Badge>);
    expect(screen.getByText("Tag").className).toContain("custom-badge");
  });

  it("renders as span element", () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText("Tag").tagName).toBe("SPAN");
  });
});
