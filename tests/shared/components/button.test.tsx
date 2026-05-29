import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "~/shared/components/button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Nhấn vào</Button>);
    expect(screen.getByRole("button", { name: "Nhấn vào" })).toBeInTheDocument();
  });

  it("applies default variant and size", () => {
    render(<Button>Mặc định</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-primary");
    expect(btn.className).toContain("h-10");
  });

  it("renders all variants", () => {
    const variants = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
      "destructiveOutline",
    ] as const;
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      unmount();
    }
  });

  it("renders all sizes", () => {
    const sizes = ["default", "sm", "lg", "icon"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      unmount();
    }
  });

  it("shows spinner and disables when loading", () => {
    render(<Button loading>Đang tải</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("data-loading", "true");
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });

  it("disables when disabled prop is true", () => {
    render(<Button disabled>Vô hiệu</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not have aria-busy when not loading", () => {
    render(<Button>Bình thường</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  it("calls onClick handler", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Nhấn</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when loading", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading onClick={onClick}>
        Đang tải
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders icon size with sr-only wrapper", () => {
    render(<Button size="icon">Biểu tượng</Button>);
    const btn = screen.getByRole("button");
    const srOnly = btn.querySelector(".sr-only");
    expect(srOnly).toBeInTheDocument();
    expect(srOnly).toHaveTextContent("Biểu tượng");
  });

  it("merges custom className", () => {
    render(<Button className="custom-btn">Tùy chỉnh</Button>);
    expect(screen.getByRole("button").className).toContain("custom-btn");
  });

  it("renders as button element", () => {
    render(<Button>Nút</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });
});
