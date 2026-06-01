import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "~/shared/components/atoms/textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with defaultValue", () => {
    render(<Textarea defaultValue="Nội dung" />);
    expect(screen.getByDisplayValue("Nội dung")).toBeInTheDocument();
  });

  it("applies default variant", () => {
    render(<Textarea />);
    const el = screen.getByRole("textbox");
    expect(el.className).toContain("border");
    expect(el.className).toContain("bg-background");
  });

  it("renders filled variant", () => {
    render(<Textarea variant="filled" />);
    const el = screen.getByRole("textbox");
    expect(el.className).toContain("bg-muted");
  });

  it("shows error state with aria-invalid", () => {
    render(<Textarea error />);
    const el = screen.getByRole("textbox");
    expect(el).toHaveAttribute("aria-invalid", "true");
    expect(el).toHaveAttribute("data-error", "true");
    expect(el.className).toContain("border-destructive");
  });

  it("does not have aria-invalid when no error", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("disables textarea", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("merges custom className", () => {
    render(<Textarea className="custom-textarea" />);
    expect(screen.getByRole("textbox").className).toContain("custom-textarea");
  });

  it("accepts rows prop", () => {
    render(<Textarea rows={5} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
  });
});
