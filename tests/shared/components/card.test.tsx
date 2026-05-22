import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/shared/components/card";

describe("Card", () => {
  it("renders with children", () => {
    render(<Card>Nội dung thẻ</Card>);
    expect(screen.getByText("Nội dung thẻ")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Card>Mặc định</Card>);
    const card = screen.getByText("Mặc định");
    expect(card.className).toContain("border");
    expect(card.className).toContain("border-border");
  });

  it("renders all variants", () => {
    const variants = ["default", "bordered", "elevated"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Card variant={variant}>{variant}</Card>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("applies bordered variant class", () => {
    render(<Card variant="bordered">Có viền</Card>);
    expect(screen.getByText("Có viền").className).toContain("border-2");
  });

  it("applies elevated variant class", () => {
    render(<Card variant="elevated">Nổi</Card>);
    expect(screen.getByText("Nổi").className).toContain("shadow-lg");
  });

  it("merges custom className", () => {
    render(<Card className="my-card">Tùy chỉnh</Card>);
    expect(screen.getByText("Tùy chỉnh").className).toContain("my-card");
  });
});

describe("CardHeader", () => {
  it("renders with children", () => {
    render(<CardHeader>Tiêu đề</CardHeader>);
    expect(screen.getByText("Tiêu đề")).toBeInTheDocument();
  });
});

describe("CardTitle", () => {
  it("renders as h3", () => {
    render(<CardTitle>Tên thẻ</CardTitle>);
    const el = screen.getByText("Tên thẻ");
    expect(el.tagName).toBe("H3");
    expect(el.className).toContain("font-semibold");
  });
});

describe("CardDescription", () => {
  it("renders description", () => {
    render(<CardDescription>Mô tả</CardDescription>);
    expect(screen.getByText("Mô tả")).toBeInTheDocument();
  });
});

describe("CardContent", () => {
  it("renders content area", () => {
    render(<CardContent>Bên trong</CardContent>);
    expect(screen.getByText("Bên trong")).toBeInTheDocument();
  });
});

describe("CardFooter", () => {
  it("renders footer with children", () => {
    render(<CardFooter>Chân trang</CardFooter>);
    expect(screen.getByText("Chân trang")).toBeInTheDocument();
  });
});
