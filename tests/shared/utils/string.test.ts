import { describe, expect, it } from "vitest";

import { getStringParam } from "~/shared/utils/string";

describe("getStringParam", () => {
  it("returns default value when param is missing", () => {
    const url = new URL("http://example.com");
    expect(getStringParam(url, "search", "default")).toBe("default");
  });

  it("returns empty string as default when no default provided", () => {
    const url = new URL("http://example.com");
    expect(getStringParam(url, "search")).toBe("");
  });

  it("returns param value when present", () => {
    const url = new URL("http://example.com?search=xin+chao");
    expect(getStringParam(url, "search")).toBe("xin chao");
  });

  it("truncates to maxLength", () => {
    const url = new URL("http://example.com?search=hello+world");
    expect(getStringParam(url, "search", "", 5)).toBe("hello");
  });

  it("does not truncate when value is within maxLength", () => {
    const url = new URL("http://example.com?search=hi");
    expect(getStringParam(url, "search", "", 10)).toBe("hi");
  });

  it("accepts string URL input", () => {
    expect(getStringParam("http://example.com?name=test", "name")).toBe("test");
  });

  it("returns default for empty param value", () => {
    const url = new URL("http://example.com?search=");
    expect(getStringParam(url, "search", "fallback")).toBe("fallback");
  });

  it("handles maxLength of 0 as no truncation", () => {
    const url = new URL("http://example.com?search=hello");
    expect(getStringParam(url, "search", "", 0)).toBe("hello");
  });
});
