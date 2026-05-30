import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupedSelect } from "~/shared/components/grouped-select";

const groups = [
  {
    label: "Huyện Châu Đức",
    options: [
      { key: "ward1", label: "Xã Xuân Sơn" },
      { key: "ward2", label: "Xã Láng Lớn" },
      { key: "ward3", label: "Xã Đá Bạc", disabled: true },
    ],
  },
  {
    label: "Thành phố Vũng Tàu",
    options: [
      { key: "ward4", label: "Phường 1" },
      { key: "ward5", label: "Phường 2" },
    ],
  },
];

describe("GroupedSelect", () => {
  it("renders with placeholder when no value selected", () => {
    render(<GroupedSelect groups={groups} value="" onChange={vi.fn()} />);
    expect(screen.getByText("Chọn…")).toBeInTheDocument();
  });

  it("renders selected option label", () => {
    render(<GroupedSelect groups={groups} value="ward2" onChange={vi.fn()} />);
    expect(screen.getByText("Xã Láng Lớn")).toBeInTheDocument();
  });

  it("opens dropdown on click and shows group headers and options", async () => {
    const user = userEvent.setup();
    render(<GroupedSelect groups={groups} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Huyện Châu Đức")).toBeInTheDocument();
    expect(screen.getByText("Thành phố Vũng Tàu")).toBeInTheDocument();
    expect(screen.getByText("Xã Xuân Sơn")).toBeInTheDocument();
    expect(screen.getByText("Phường 1")).toBeInTheDocument();
  });

  it("renders default option when provided", async () => {
    const user = userEvent.setup();
    render(
      <GroupedSelect
        groups={groups}
        value=""
        onChange={vi.fn()}
        defaultOption={{ key: "", label: "Tất cả khu vực" }}
      />
    );
    expect(screen.getByText("Tất cả khu vực")).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    const options = screen.getAllByRole("option");
    expect(options[0].textContent).toBe("Tất cả khu vực");
  });

  it("closes dropdown and calls onChange on option click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GroupedSelect groups={groups} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Xã Xuân Sơn"));
    
    expect(onChange).toHaveBeenCalledWith("ward1");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("does not call onChange for disabled option click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GroupedSelect groups={groups} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Xã Đá Bạc"));
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes on outside click", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">Bên ngoài</span>
        <GroupedSelect groups={groups} value="" onChange={vi.fn()} />
      </div>
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    
    await user.click(screen.getByTestId("outside"));
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("navigates options with ArrowDown, ArrowUp and Enter", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <GroupedSelect
        groups={groups}
        value=""
        onChange={onChange}
        defaultOption={{ key: "", label: "Tất cả khu vực" }}
      />
    );
    await user.click(screen.getByRole("button"));

    // We start at index 0 (Tất cả khu vực)
    await user.keyboard("{ArrowDown}"); // moves to ward1 (Xã Xuân Sơn)
    await user.keyboard("{ArrowDown}"); // moves to ward2 (Xã Láng Lớn)
    await user.keyboard("{ArrowDown}"); // tries ward3 (disabled), skips to ward4 (Phường 1)
    await user.keyboard("{ArrowUp}");   // moves back to ward2 (Xã Láng Lớn)
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("ward2");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<GroupedSelect groups={groups} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("disabled button prevents interaction", () => {
    render(<GroupedSelect groups={groups} value="" onChange={vi.fn()} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("marks selected option with aria-selected", async () => {
    const user = userEvent.setup();
    render(<GroupedSelect groups={groups} value="ward1" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    
    const options = screen.getAllByRole("option");
    const selected = options.find((opt) => opt.textContent === "Xã Xuân Sơn");
    expect(selected).toHaveAttribute("aria-selected", "true");
  });

  it("marks disabled option with aria-disabled", async () => {
    const user = userEvent.setup();
    render(<GroupedSelect groups={groups} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    
    const option = screen.getByText("Xã Đá Bạc").closest('[role="option"]');
    expect(option).toHaveAttribute("aria-disabled", "true");
  });
});
