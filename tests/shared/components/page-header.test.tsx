import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "~/shared/components/page-header";

describe("PageHeader", () => {
  it("renders title as h1", () => {
    render(<PageHeader title="Tiêu đề trang" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Tiêu đề trang");
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Tiêu đề" description="Mô tả trang" />);
    expect(screen.getByText("Mô tả trang")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<PageHeader title="Tiêu đề" />);
    expect(screen.queryByText("Mô tả trang")).not.toBeInTheDocument();
  });

  it("renders actions slot", () => {
    render(
      <PageHeader
        title="Tiêu đề"
        actions={<button>Thêm mới</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Thêm mới" })).toBeInTheDocument();
  });

  it("does not render actions when not provided", () => {
    render(<PageHeader title="Tiêu đề" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PageHeader title="Tiêu đề" className="custom-header" />,
    );
    expect(container.firstChild).toHaveClass("custom-header");
  });

  it("passes additional props to container", () => {
    render(<PageHeader title="Tiêu đề" data-testid="page-header" />);
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
  });

  it("renders ReactNode as title", () => {
    render(<PageHeader title={<span data-testid="custom-title">Tùy chỉnh</span>} />);
    expect(screen.getByTestId("custom-title")).toBeInTheDocument();
  });
});
