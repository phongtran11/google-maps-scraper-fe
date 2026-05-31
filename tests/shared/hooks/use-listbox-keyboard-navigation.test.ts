import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useListboxKeyboardNavigation } from "~/shared/hooks";

describe("useListboxKeyboardNavigation", () => {
  const options = [
    { key: "1" },
    { key: "2", disabled: true },
    { key: "3" },
  ];

  it("ArrowDown moves focus to next option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 0,
      onFocusIndexChange,
      onSelect: vi.fn(),
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    document.dispatchEvent(event);

    expect(onFocusIndexChange).toHaveBeenCalledWith(2); // skips index 1 because it's disabled
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("ArrowDown stops at last option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 2,
      onFocusIndexChange,
      onSelect: vi.fn(),
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    document.dispatchEvent(event);

    expect(onFocusIndexChange).not.toHaveBeenCalled();
  });

  it("ArrowUp moves focus to previous option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 2,
      onFocusIndexChange,
      onSelect: vi.fn(),
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    document.dispatchEvent(event);

    expect(onFocusIndexChange).toHaveBeenCalledWith(0); // skips index 1 because it's disabled
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("ArrowUp stops at first option", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 0,
      onFocusIndexChange,
      onSelect: vi.fn(),
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    document.dispatchEvent(event);

    expect(onFocusIndexChange).not.toHaveBeenCalled();
  });

  it("Enter selects focused option", () => {
    const onSelect = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 2,
      onFocusIndexChange: vi.fn(),
      onSelect,
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(event);

    expect(onSelect).toHaveBeenCalledWith(options[2]);
  });

  it("Enter does nothing if focused option is disabled", () => {
    const onSelect = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 1,
      onFocusIndexChange: vi.fn(),
      onSelect,
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(event);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Escape calls onClose", () => {
    const onClose = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: true,
      options,
      focusIndex: 0,
      onFocusIndexChange: vi.fn(),
      onSelect: vi.fn(),
      onClose,
    }));

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalled();
  });

  it("does not handle keys when enabled is false", () => {
    const onFocusIndexChange = vi.fn();
    renderHook(() => useListboxKeyboardNavigation({
      enabled: false,
      options,
      focusIndex: 0,
      onFocusIndexChange,
      onSelect: vi.fn(),
      onClose: vi.fn(),
    }));

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    document.dispatchEvent(event);

    expect(onFocusIndexChange).not.toHaveBeenCalled();
  });
});
