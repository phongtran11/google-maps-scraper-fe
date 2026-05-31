import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "~/shared/components/atoms/field";

describe("Field", () => {
  it("renders label and children", () => {
    render(<Field label="Tên">Giá trị</Field>);
    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Giá trị")).toBeInTheDocument();
  });

  it("renders fallback for null children", () => {
    render(<Field label="Trường trống">{null}</Field>);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders undefined children as fallback", () => {
    render(<Field label="Trường trống">{undefined}</Field>);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("wraps in dl element", () => {
    const { container } = render(<Field label="Tên">Giá trị</Field>);
    expect(container.querySelector("dl")).toBeInTheDocument();
  });

  it("renders dt for label with correct styles", () => {
    render(<Field label="Tên">Giá trị</Field>);
    const dt = screen.getByText("Tên");
    expect(dt.tagName).toBe("DT");
    expect(dt.className).toContain("uppercase");
    expect(dt.className).toContain("tracking-wider");
  });

  it("renders dd for value", () => {
    render(<Field label="Tên">Giá trị</Field>);
    const dd = screen.getByText("Giá trị");
    expect(dd.tagName).toBe("DD");
  });
});
