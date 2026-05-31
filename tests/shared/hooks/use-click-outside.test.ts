import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClickOutside } from "~/shared/hooks";

describe("useClickOutside", () => {
  it("calls callback when clicking outside ref element", () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    document.body.appendChild(div);
    const ref = { current: div };

    renderHook(() => useClickOutside(ref, callback, true));

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.body.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    document.body.removeChild(div);
  });

  it("does not call callback when clicking inside ref element", () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    document.body.appendChild(div);
    const ref = { current: div };

    renderHook(() => useClickOutside(ref, callback, true));

    const event = new MouseEvent("mousedown", { bubbles: true });
    div.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it("does not call callback when enabled is false", () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    document.body.appendChild(div);
    const ref = { current: div };

    renderHook(() => useClickOutside(ref, callback, false));

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.body.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });

  it("cleans up listener on unmount", () => {
    const callback = vi.fn();
    const div = document.createElement("div");
    document.body.appendChild(div);
    const ref = { current: div };

    const { unmount } = renderHook(() => useClickOutside(ref, callback, true));
    unmount();

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.body.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
    document.body.removeChild(div);
  });
});
