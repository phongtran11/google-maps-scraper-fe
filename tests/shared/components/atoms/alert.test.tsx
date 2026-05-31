import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "~/shared/components/atoms/alert";

describe("Alert", () => {
  it("renders with default variant", () => {
    render(<Alert>Thông báo</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Thông báo");
  });

  it("renders with role alert", () => {
    render(<Alert variant="destructive">Lỗi</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Alert variant="success">Thành công</Alert>);
    const alert = container.firstElementChild;
    expect(alert?.className).toContain("bg-success/10");
  });

  it("renders all supported variants", () => {
    const variants = ["default", "info", "success", "warning", "destructive"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Alert variant={variant}>{variant}</Alert>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      unmount();
    }
  });

  it("merges custom className", () => {
    render(<Alert className="custom-class">Nội dung</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("custom-class");
  });

  it("passes additional DOM props", () => {
    render(<Alert data-testid="my-alert">Nội dung</Alert>);
    expect(screen.getByTestId("my-alert")).toBeInTheDocument();
  });
});

describe("AlertTitle", () => {
  it("renders as h5", () => {
    render(<AlertTitle>Tiêu đề</AlertTitle>);
    expect(screen.getByText("Tiêu đề").tagName).toBe("H5");
  });

  it("passes className", () => {
    render(<AlertTitle className="text-red-500">Tiêu đề</AlertTitle>);
    expect(screen.getByText("Tiêu đề").className).toContain("text-red-500");
  });
});

describe("AlertDescription", () => {
  it("renders description text", () => {
    render(<AlertDescription>Mô tả chi tiết</AlertDescription>);
    expect(screen.getByText("Mô tả chi tiết")).toBeInTheDocument();
  });
});

describe("AlertAction", () => {
  it("renders action container with children", () => {
    render(
      <AlertAction>
        <button>OK</button>
      </AlertAction>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});
