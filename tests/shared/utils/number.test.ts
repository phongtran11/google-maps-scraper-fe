import { describe, expect, it } from "vitest";

import { getIntParam, getIntParams, parseId } from "~/shared/utils/number";

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
    expect(getIntParam(url, "page", 5, { max: 10, min: 1 })).toBe(1);
  });

  it("returns value within range", () => {
    const url = new URL("http://example.com?page=5");
    expect(getIntParam(url, "page", 1, { max: 10, min: 1 })).toBe(5);
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

describe("getIntParams", () => {
  it("returns defaultValue when param is missing", () => {
    const url = new URL("http://example.com");
    expect(getIntParams(url, "wardId", [1, 2])).toEqual([1, 2]);
  });

  it("returns parsed integers from multiple parameters", () => {
    const url = new URL("http://example.com?wardId=10&wardId=20");
    expect(getIntParams(url, "wardId", [])).toEqual([10, 20]);
  });

  it("returns parsed integers from a comma-separated parameter", () => {
    const url = new URL("http://example.com?wardId=10,20,30");
    expect(getIntParams(url, "wardId", [])).toEqual([10, 20, 30]);
  });

  it("returns parsed integers combining both multiple and comma-separated formats", () => {
    const url = new URL("http://example.com?wardId=10,20&wardId=30");
    expect(getIntParams(url, "wardId", [])).toEqual([10, 20, 30]);
  });

  it("filters out invalid NaN values", () => {
    const url = new URL("http://example.com?wardId=10,abc,20");
    expect(getIntParams(url, "wardId", [])).toEqual([10, 20]);
  });
});

describe("parseId", () => {
  it("parses valid numeric string", () => {
    expect(parseId("123")).toBe(123);
  });

  it("returns number when input is already a number", () => {
    expect(parseId(456)).toBe(456);
  });

  it("returns null for invalid string", () => {
    expect(parseId("abc")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseId("")).toBeNull();
  });
});
