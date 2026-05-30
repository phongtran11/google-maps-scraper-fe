import { describe, it, expect } from "vitest";
import { getIntParam } from "~/shared/utils/number";

describe("getIntParam", () => {
  it("returns default value when param is missing", () => {
    const url = new URL("http://example.com");
    expect(getIntParam(url, "page", 1)).toBe(1);
  });

  it("returns default value when param is not a number", () => {
    const url = new URL("http://example.com?page=abc");
    expect(getIntParam(url, "page", 1)).toBe(1);
  });

  it("returns parsed integer value", () => {
    const url = new URL("http://example.com?page=5");
    expect(getIntParam(url, "page", 1)).toBe(5);
  });

  it("clamps to min value when below minimum", () => {
    const url = new URL("http://example.com?page=-1");
    expect(getIntParam(url, "page", 1, { min: 1 })).toBe(1);
  });

  it("clamps to max value when above maximum", () => {
    const url = new URL("http://example.com?page=100");
    expect(getIntParam(url, "page", 1, { max: 50 })).toBe(50);
  });

  it("applies both min and max", () => {
    const url = new URL("http://example.com?page=0");
    expect(getIntParam(url, "page", 5, { min: 1, max: 10 })).toBe(1);
  });

  it("returns value within range", () => {
    const url = new URL("http://example.com?page=5");
    expect(getIntParam(url, "page", 1, { min: 1, max: 10 })).toBe(5);
  });

  it("accepts string URL input", () => {
    expect(getIntParam("http://example.com?page=3", "page", 1)).toBe(3);
  });

  it("handles empty string param value", () => {
    const url = new URL("http://example.com?page=");
    expect(getIntParam(url, "page", 1)).toBe(1);
  });

  it("handles float values by truncating to integer", () => {
    const url = new URL("http://example.com?page=3.7");
    expect(getIntParam(url, "page", 1)).toBe(3);
  });
});
