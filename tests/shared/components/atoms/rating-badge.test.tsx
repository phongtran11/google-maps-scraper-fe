import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingBadge } from "~/shared/components/atoms/rating-badge";

describe("RatingBadge", () => {
  it("returns null when rating is null", () => {
    const { container } = render(<RatingBadge rating={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when rating is undefined", () => {
    const { container } = render(<RatingBadge rating={undefined as unknown as number} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when rating is NaN", () => {
    const { container } = render(<RatingBadge rating={NaN} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when rating is Infinity", () => {
    const { container } = render(<RatingBadge rating={Infinity} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders success variant for rating >= 4.5", () => {
    render(<RatingBadge rating={4.6} />);
    const badge = screen.getByText("4.6");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-success/15");
  });

  it("renders info variant for rating >= 4 and < 4.5", () => {
    render(<RatingBadge rating={4.2} />);
    const badge = screen.getByText("4.2");
    expect(badge.className).toContain("bg-info/15");
  });

  it("renders warning variant for rating < 4", () => {
    render(<RatingBadge rating={3.5} />);
    const badge = screen.getByText("3.5");
    expect(badge.className).toContain("bg-warning/15");
  });

  it("displays one decimal place", () => {
    render(<RatingBadge rating={4.5678} />);
    expect(screen.getByText("4.6")).toBeInTheDocument();
  });

  it("handles string number ratings", () => {
    render(<RatingBadge rating={"4.8" as unknown as number} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("has aria-label with Vietnamese", () => {
    render(<RatingBadge rating={4.5} />);
    expect(screen.getByText("4.5")).toHaveAttribute("aria-label", "Đánh giá 4.5 trên 5 sao");
  });

  it("renders 0.0 for zero rating", () => {
    render(<RatingBadge rating={0} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });
});
