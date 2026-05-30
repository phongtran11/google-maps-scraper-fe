import { describe, it, expect } from "vitest";
import { formatZaloPhone } from "~/shared/utils/phone";

describe("formatZaloPhone", () => {
  it("returns null for null input", () => {
    expect(formatZaloPhone(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatZaloPhone("")).toBeNull();
  });

  it("returns null for string with no digits", () => {
    expect(formatZaloPhone("abc")).toBeNull();
  });

  it("converts 0-prefix to 84-prefix", () => {
    expect(formatZaloPhone("0987654321")).toBe("84987654321");
  });

  it("keeps 84-prefix as is", () => {
    expect(formatZaloPhone("84987654321")).toBe("84987654321");
  });

  it("adds 84 prefix for other numbers", () => {
    expect(formatZaloPhone("987654321")).toBe("84987654321");
  });

  it("strips non-digit characters", () => {
    expect(formatZaloPhone("+84 987-654-321")).toBe("84987654321");
  });

  it("strips parentheses and spaces", () => {
    expect(formatZaloPhone("(098) 765 4321")).toBe("84987654321");
  });

  it("handles single digit 0", () => {
    expect(formatZaloPhone("0")).toBe("84");
  });
});
