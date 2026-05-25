import { describe, it, expect } from "vitest";
import { getPageNumbers } from "~/lib/utils";

describe("getPageNumbers", () => {
  it("returns all pages when totalPages <= 7", () => {
    expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(getPageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("shows first 5, ellipsis, last when currentPage <= 4", () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
    expect(getPageNumbers(4, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
  });

  it("shows first, ellipsis, last 5 when currentPage near end", () => {
    expect(getPageNumbers(8, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
    expect(getPageNumbers(10, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
    expect(getPageNumbers(7, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
  });

  it("shows first, ellipsis, prev/current/next, ellipsis, last in middle", () => {
    expect(getPageNumbers(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
    expect(getPageNumbers(6, 10)).toEqual([1, "...", 5, 6, 7, "...", 10]);
  });

  it("handles edge case: totalPages = 1", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
  });

  it("handles edge case: totalPages = 2", () => {
    expect(getPageNumbers(1, 2)).toEqual([1, 2]);
  });

  it("handles edge case: totalPages = 7 boundary", () => {
    expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("handles edge case: totalPages = 8", () => {
    expect(getPageNumbers(4, 8)).toEqual([1, 2, 3, 4, 5, "...", 8]);
    expect(getPageNumbers(1, 8)).toEqual([1, 2, 3, 4, 5, "...", 8]);
    expect(getPageNumbers(5, 8)).toEqual([1, "...", 4, 5, 6, 7, 8]);
    expect(getPageNumbers(8, 8)).toEqual([1, "...", 4, 5, 6, 7, 8]);
  });
});
