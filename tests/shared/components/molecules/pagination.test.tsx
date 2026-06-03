import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "~/shared/components/molecules/pagination";

function renderPagination(props: Partial<Parameters<typeof Pagination>[0]> = {}) {
  return render(
    <Pagination
      getPageUrl={props.getPageUrl ?? ((p) => `/?page=${p}`)}
      onPageSizeChange={props.onPageSizeChange}
      page={props.page ?? 1}
      pageSize={props.pageSize ?? 10}
      pageSizeOptions={props.pageSizeOptions}
      totalCount={props.totalCount ?? 100}
      totalPages={props.totalPages ?? 10}
    />,
    { wrapper: MemoryRouter },
  );
}

describe("Pagination", () => {
  it("returns null when only 1 page and no pageSizeOptions", () => {
    const { container } = render(
      <Pagination
        getPageUrl={(p) => `/?page=${p}`}
        page={1}
        pageSize={10}
        totalCount={5}
        totalPages={1}
      />,
      { wrapper: MemoryRouter },
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when pageSizeOptions is provided even with 1 page", () => {
    renderPagination({
      onPageSizeChange: vi.fn(),
      pageSizeOptions: [5, 10, 20],
      totalCount: 5,
      totalPages: 1,
    });
    expect(screen.getByText(/Hiển thị/)).toBeInTheDocument();
  });

  it("renders nav with aria-label", () => {
    renderPagination();
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Phân trang");
  });

  it("displays range summary", () => {
    renderPagination({ page: 2, pageSize: 10, totalCount: 100, totalPages: 10 });
    expect(screen.getByText(/Hiển thị/)).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("shows 0 for range when totalCount is 0", () => {
    renderPagination({ totalCount: 0, totalPages: 5 });
    const nav = screen.getByRole("navigation");
    expect(nav.textContent).toContain("Hiển thị");
    expect(nav.textContent).toContain("0");
  });

  it("renders page number links", () => {
    renderPagination({ totalPages: 5 });
    const nav = screen.getByRole("navigation");
    for (let i = 1; i <= 5; i++) {
      const links = nav.querySelectorAll("a");
      const link = Array.from(links).find((l) => l.textContent?.trim() === String(i));
      expect(link).toBeInTheDocument();
    }
  });

  it("activates current page", () => {
    renderPagination({ page: 3, totalPages: 5 });
    const activeLink = screen.getByText("3");
    expect(activeLink.className).toContain("bg-primary");
  });

  it("non-active pages do not have primary background", () => {
    renderPagination({ page: 3, totalPages: 5 });
    const nonActive = screen.getByText("1");
    expect(nonActive.className).not.toContain("bg-primary");
  });

  it("disables previous on first page", () => {
    renderPagination({ page: 1, totalPages: 10 });
    const prevLink = screen.getByLabelText("Trang trước");
    expect(prevLink.className).toContain("opacity-40");
    expect(prevLink.getAttribute("href")).toBe("/");
  });

  it("enables previous when not on first page", () => {
    renderPagination({ page: 3, totalPages: 10 });
    const prevLink = screen.getByLabelText("Trang trước");
    expect(prevLink.className).not.toContain("opacity-40");
    expect(prevLink.getAttribute("href")).toContain("page=2");
  });

  it("disables next on last page", () => {
    renderPagination({ page: 10, totalPages: 10 });
    const nextLink = screen.getByLabelText("Trang sau");
    expect(nextLink.className).toContain("opacity-40");
    expect(nextLink.getAttribute("href")).toBe("/");
  });

  it("enables next when not on last page", () => {
    renderPagination({ page: 5, totalPages: 10 });
    const nextLink = screen.getByLabelText("Trang sau");
    expect(nextLink.className).not.toContain("opacity-40");
    expect(nextLink.getAttribute("href")).toContain("page=6");
  });

  it("renders ellipsis for large page counts", () => {
    renderPagination({ page: 5, totalPages: 10 });
    const ellipsis = screen.queryAllByText("...");
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it("renders page-size selector when options provided", () => {
    renderPagination({
      onPageSizeChange: vi.fn(),
      pageSizeOptions: [5, 10, 20],
    });
    expect(screen.getByRole("button", { name: "Số dòng mỗi trang" })).toBeInTheDocument();
  });

  it("calls onPageSizeChange when page size is changed", async () => {
    const onPageSizeChange = vi.fn();
    const user = userEvent.setup();
    renderPagination({
      onPageSizeChange,
      pageSizeOptions: [5, 10, 20],
    });
    const selectButton = screen.getByRole("button", { name: "Số dòng mỗi trang" });
    await user.click(selectButton);
    const option20 = screen.getByText("20");
    await user.click(option20);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
