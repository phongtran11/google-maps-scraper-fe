import { describe, it, expect, vi, afterEach } from "vitest";
import { relativeTime } from "~/shared/utils/date";

describe("relativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "vừa xong" for less than 1 minute ago', () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-15T09:59:30Z");
    expect(relativeTime(date)).toBe("vừa xong");
  });

  it('returns "vừa xong" for exact now', () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    expect(relativeTime(now)).toBe("vừa xong");
  });

  it("returns minutes ago for less than 60 minutes", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-15T09:45:00Z");
    expect(relativeTime(date)).toBe("15 phút trước");
  });

  it("returns 1 minute ago", () => {
    const now = new Date("2024-01-15T10:01:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-15T10:00:00Z");
    expect(relativeTime(date)).toBe("1 phút trước");
  });

  it("returns hours ago for less than 24 hours", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-15T07:00:00Z");
    expect(relativeTime(date)).toBe("3 giờ trước");
  });

  it("returns 1 hour ago", () => {
    const now = new Date("2024-01-15T11:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-15T10:00:00Z");
    expect(relativeTime(date)).toBe("1 giờ trước");
  });

  it("returns days ago for 24+ hours", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-13T10:00:00Z");
    expect(relativeTime(date)).toBe("2 ngày trước");
  });

  it("returns 1 day ago", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-01-14T10:00:00Z");
    expect(relativeTime(date)).toBe("1 ngày trước");
  });

  it("accepts string input", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    expect(relativeTime("2024-01-15T09:00:00Z")).toBe("1 giờ trước");
  });

  it("accepts Date input", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    vi.setSystemTime(now);
    expect(relativeTime(new Date("2024-01-15T09:00:00Z"))).toBe("1 giờ trước");
  });
});
