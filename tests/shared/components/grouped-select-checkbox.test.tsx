import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupedSelectCheckbox } from "~/shared/components/grouped-select-checkbox";

const groups = [
  {
    key: "dist1",
    label: "Huyện Châu Đức",
    options: [
      { key: "ward1", label: "Xã Xuân Sơn" },
      { key: "ward2", label: "Xã Láng Lớn" },
      { key: "ward3", label: "Xã Đá Bạc", disabled: true },
    ],
  },
  {
    key: "dist2",
    label: "Thành phố Vũng Tàu",
    options: [
      { key: "ward4", label: "Phường 1" },
      { key: "ward5", label: "Phường 2" },
    ],
  },
];

describe("GroupedSelectCheckbox", () => {
  it("renders with placeholder when no value is selected", () => {
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={vi.fn()} placeholder="Tất cả khu vực" />);
    expect(screen.getByText("Tất cả khu vực")).toBeInTheDocument();
  });

  it("renders comma-separated labels of selected options", () => {
    render(<GroupedSelectCheckbox groups={groups} value={["ward1", "ward4"]} onChange={vi.fn()} />);
    expect(screen.getByText("Xã Xuân Sơn, Phường 1")).toBeInTheDocument();
  });

  it("opens popover on click and shows category tabs and active group options", async () => {
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Huyện Châu Đức")).toBeInTheDocument();
    expect(screen.getByText("Thành phố Vũng Tàu")).toBeInTheDocument();
    
    // Default active is Huyện Châu Đức (first group)
    expect(screen.getByText("Xã Xuân Sơn")).toBeInTheDocument();
    expect(screen.getByText("Xã Láng Lớn")).toBeInTheDocument();
    // Phường 1 belongs to Thành phố Vũng Tàu, so it shouldn't render yet
    expect(screen.queryByText("Phường 1")).not.toBeInTheDocument();
  });

  it("switches active group when clicking a different category tab", async () => {
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));

    // Switch to Vũng Tàu
    await user.click(screen.getByText("Thành phố Vũng Tàu"));
    expect(screen.getByText("Phường 1")).toBeInTheDocument();
    expect(screen.getByText("Phường 2")).toBeInTheDocument();
    
    // Châu Đức options should not be visible anymore
    expect(screen.queryByText("Xã Xuân Sơn")).not.toBeInTheDocument();
  });

  it("displays draft counts on category tab", async () => {
    const user = userEvent.setup();
    // Initially selected ward1 and ward2 in dist1
    render(<GroupedSelectCheckbox groups={groups} value={["ward1", "ward2"]} onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));

    // Find the count badge next to Châu Đức
    const badge = screen.getByText("2");
    expect(badge).toBeInTheDocument();
    expect(badge.closest("button")).toHaveTextContent("Huyện Châu Đức");
  });

  it("updates draft counts dynamically when checking checkboxes", async () => {
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));

    // Select Xã Xuân Sơn
    await user.click(screen.getByText("Xã Xuân Sơn"));
    // Count should become 1
    expect(screen.getByText("1")).toBeInTheDocument();

    // Deselect Xã Xuân Sơn
    await user.click(screen.getByText("Xã Xuân Sơn"));
    // Count badge should disappear
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("toggles all options in the active group when clicking Select All", async () => {
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));

    // Click "Chọn tất cả" in Châu Đức
    await user.click(screen.getByText("Chọn tất cả"));
    // ward1 and ward2 should be selected (ward3 is disabled)
    // Châu Đức count should be 2
    expect(screen.getByText("2")).toBeInTheDocument();

    // Click "Chọn tất cả" again to deselect all in active group
    await user.click(screen.getByText("Chọn tất cả"));
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("calls onChange with updated values when clicking Apply", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={onChange} />);
    await user.click(screen.getByRole("button"));

    await user.click(screen.getByText("Xã Xuân Sơn"));
    await user.click(screen.getByText("Thành phố Vũng Tàu"));
    await user.click(screen.getByText("Phường 1"));

    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    expect(onChange).toHaveBeenCalledWith(["ward1", "ward4"]);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not call onChange and discards draft changes when clicking Cancel", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={onChange} />);
    await user.click(screen.getByRole("button"));

    await user.click(screen.getByText("Xã Xuân Sơn"));
    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not call onChange and discards draft changes when clicking outside", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Bên ngoài</div>
        <GroupedSelectCheckbox groups={groups} value={[]} onChange={onChange} />
      </div>
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Xã Xuân Sơn"));

    await user.click(screen.getByTestId("outside"));

    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not call onChange and discards draft changes when pressing Escape", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Xã Xuân Sơn"));

    await user.keyboard("{Escape}");

    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("prevents interaction when disabled", () => {
    render(<GroupedSelectCheckbox groups={groups} value={[]} onChange={vi.fn()} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
