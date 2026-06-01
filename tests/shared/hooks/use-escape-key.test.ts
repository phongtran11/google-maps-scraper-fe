import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useEscapeKey } from "~/shared/hooks";

describe("useEscapeKey", () => {
  it("calls callback when Escape is pressed", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, true));

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not call callback for other keys", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, true));

    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not call callback when enabled is false", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, false));

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it("uses document as default target", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, true));

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("uses window when target: 'window' is specified", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, true, { target: "window" }));

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cleans up listener on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(callback, true));
    unmount();

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
});
