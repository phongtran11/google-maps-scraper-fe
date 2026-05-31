import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "~/shared/components/molecules/toast";

function TestConsumer() {
  const { toast, dismiss } = useToast();
  return (
    <div>
      <button
        onClick={() =>
          toast({
            title: "Thành công",
            description: "Thao tác hoàn tất",
            variant: "success",
          })
        }
      >
        Hiển thị toast
      </button>
      <button
        onClick={() => {
          const id = toast({ title: "Có thể tắt" });
          dismiss(id);
        }}
      >
        Toast rồi tắt
      </button>
      <button
        onClick={() =>
          toast({
            title: "Có hành động",
            action: {
              label: "Hoàn tác",
              onClick: vi.fn(),
            },
          })
        }
      >
        Toast có action
      </button>
    </div>
  );
}

describe("ToastProvider", () => {
  it("renders children", () => {
    render(
      <ToastProvider>
        <div>Nội dung</div>
      </ToastProvider>,
    );
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
  });

  it("throws error when useToast is used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    function BrokenComponent() {
      useToast();
      return null;
    }
    expect(() => render(<BrokenComponent />)).toThrow(
      "useToast must be used within a ToastProvider",
    );
    consoleError.mockRestore();
  });

  it("toast() adds a toast", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    await user.click(screen.getByText("Hiển thị toast"));
    expect(screen.getByText("Thành công")).toBeInTheDocument();
    expect(screen.getByText("Thao tác hoàn tất")).toBeInTheDocument();
  });

  it("dismiss() removes a toast", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    await user.click(screen.getByText("Toast rồi tắt"));
    expect(screen.queryByText("Có thể tắt")).not.toBeInTheDocument();
  });

  it("renders toast action button", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    await user.click(screen.getByText("Toast có action"));
    expect(screen.getByText("Hoàn tác")).toBeInTheDocument();
  });

  it("close button renders with X icon", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    await user.click(screen.getByText("Hiển thị toast"));
    const closeButton = screen.getByRole("button", { name: "" });
    expect(closeButton.querySelector("svg")).toBeInTheDocument();
  });

  it("viewports render with correct position", () => {
    const { container } = render(
      <ToastProvider position="top-left">
        <div>Nội dung</div>
      </ToastProvider>,
    );
    const viewport = container.querySelector("ol");
    expect(viewport).toBeInTheDocument();
    expect(viewport?.className).toContain("top-0");
    expect(viewport?.className).toContain("left-0");
  });

  it("renders Radix Provider and Viewport", () => {
    const { container } = render(
      <ToastProvider>
        <div>Nội dung</div>
      </ToastProvider>,
    );
    expect(container.querySelector("ol")).toBeInTheDocument();
  });

  it("toast has onOpenChange callback that dismisses", async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    const btn = screen.getByText("Hiển thị toast");
    await act(async () => {
      btn.click();
    });

    expect(screen.getByText("Thành công")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.queryByText("Thành công")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
