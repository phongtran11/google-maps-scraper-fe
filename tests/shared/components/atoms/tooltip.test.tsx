import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "~/shared/components/atoms/tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the trigger element", () => {
    render(
      <Tooltip content="Gợi ý">
        <button>Di chuột</button>
      </Tooltip>,
    );
    expect(screen.getByText("Di chuột")).toBeInTheDocument();
  });

  it("shows tooltip on hover after delay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={200}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
    expect(screen.getByText("Gợi ý")).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );

    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    await user.unhover(screen.getByText("Di chuột"));
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("shows tooltip on focus", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.tab();
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });
  });

  it("hides tooltip on blur", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.click(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    await user.tab();
    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("hides tooltip on Escape key", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("returns only children when content is empty", () => {
    const { container } = render(
      <Tooltip content="">
        <button>Nút</button>
      </Tooltip>,
    );
    expect(screen.getByText("Nút")).toBeInTheDocument();
    expect(container.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
  });

  it("returns only children when content is falsy", () => {
    render(
      <Tooltip content={null as unknown as string}>
        <button>Nút</button>
      </Tooltip>,
    );
    expect(screen.getByText("Nút")).toBeInTheDocument();
  });

  it("adds aria-describedby when tooltip is visible", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      const button = screen.getByText("Di chuột");
      expect(button).toHaveAttribute("aria-describedby");
    });
  });

  it("repositions tooltip on scroll when visible", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    fireEvent.scroll(window);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("repositions tooltip on window resize when visible", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    fireEvent.resize(window);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("cancels hide timeout when re-hovering before hide delay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    await user.unhover(screen.getByText("Di chuột"));
    // Don't wait for hide — rehover immediately
    await user.hover(screen.getByText("Di chuột"));

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("repositions tooltip on mouse move while visible", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Gợi ý" delay={0}>
        <button>Di chuột</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Di chuột"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    // Re-hover while already visible - triggers updateCoords
    await user.hover(screen.getByText("Di chuột"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
