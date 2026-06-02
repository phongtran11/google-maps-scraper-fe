import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "~/shared/components/molecules/page-header";

describe("PageHeader", () => {
  it("renders title as h1", () => {
    render(<PageHeader title="Tiêu đề trang" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Tiêu đề trang");
  });

  it("renders description when provided", () => {
    render(<PageHeader description="Mô tả trang" title="Tiêu đề" />);
    expect(screen.getByText("Mô tả trang")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<PageHeader title="Tiêu đề" />);
    expect(screen.queryByText("Mô tả trang")).not.toBeInTheDocument();
  });

  it("renders actions slot", () => {
    render(<PageHeader actions={<button>Thêm mới</button>} title="Tiêu đề" />);
    expect(screen.getByRole("button", { name: "Thêm mới" })).toBeInTheDocument();
  });

  it("does not render actions when not provided", () => {
    render(<PageHeader title="Tiêu đề" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<PageHeader className="custom-header" title="Tiêu đề" />);
    expect(container.firstChild).toHaveClass("custom-header");
  });

  it("passes additional props to container", () => {
    render(<PageHeader data-testid="page-header" title="Tiêu đề" />);
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("renders ReactNode as title", () => {
    render(<PageHeader title={<span data-testid="custom-title">Tùy chỉnh</span>} />);
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
  });
});
