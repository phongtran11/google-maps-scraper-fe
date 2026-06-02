import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useListboxKeyboardNavigation } from "~/shared/hooks";

describe("useListboxKeyboardNavigation", () => {
  const options = [{ key: "1" }, { disabled: true, key: "2" }, { key: "3" }];

  it("ArrowDown moves focus to next option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 0,
        onClose: vi.fn(),
        onFocusIndexChange,
        onSelect: vi.fn(),
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    document.dispatchEvent(event);

    expect(onFocusIndexChange).toHaveBeenCalledWith(2); // skips index 1 because it's disabled
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("ArrowDown stops at last option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 2,
        onClose: vi.fn(),
        onFocusIndexChange,
        onSelect: vi.fn(),
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    document.dispatchEvent(event);

    expect(onFocusIndexChange).not.toHaveBeenCalled();
  });

  it("ArrowUp moves focus to previous option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 2,
        onClose: vi.fn(),
        onFocusIndexChange,
        onSelect: vi.fn(),
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    document.dispatchEvent(event);

    expect(onFocusIndexChange).toHaveBeenCalledWith(0); // skips index 1 because it's disabled
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("ArrowUp stops at first option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 0,
        onClose: vi.fn(),
        onFocusIndexChange,
        onSelect: vi.fn(),
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    document.dispatchEvent(event);

    expect(onFocusIndexChange).not.toHaveBeenCalled();
  });

  it("Enter selects focused option", () => {
    const onSelect = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 2,
        onClose: vi.fn(),
        onFocusIndexChange: vi.fn(),
        onSelect,
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(event);

    expect(onSelect).toHaveBeenCalledWith(options[2]);
  });

  it("Enter does nothing if focused option is disabled", () => {
    const onSelect = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 1,
        onClose: vi.fn(),
        onFocusIndexChange: vi.fn(),
        onSelect,
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(event);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Escape calls onClose", () => {
    const onClose = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: true,
        focusIndex: 0,
        onClose,
        onFocusIndexChange: vi.fn(),
        onSelect: vi.fn(),
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalled();
  });

  it("does not handle keys when enabled is false", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() =>
      useListboxKeyboardNavigation({
        enabled: false,
        focusIndex: 0,
        onClose: vi.fn(),
        onFocusIndexChange,
        onSelect: vi.fn(),
        options,
      }),
    );

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    document.dispatchEvent(event);

    expect(onFocusIndexChange).not.toHaveBeenCalled();
  });
});
