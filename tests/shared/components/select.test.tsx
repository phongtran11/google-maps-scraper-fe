import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "~/shared/components/select";

const options = [
  { key: "option1", label: "Lựa chọn 1" },
  { key: "option2", label: "Lựa chọn 2" },
  { key: "option3", label: "Lựa chọn 3", disabled: true },
];

describe("Select", () => {

  it("renders with placeholder when no value selected", () => {
    render(<Select options={options} value="" onChange={vi.fn()} />);
    expect(screen.getByText("Chọn…")).toBeInTheDocument();
  });

  it("renders selected option label", () => {
    render(<Select options={options} value="option2" onChange={vi.fn()} />);
    expect(screen.getByText("Lựa chọn 2")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(
      <Select
        options={options}
        value=""
        onChange={vi.fn()}
        placeholder="Chọn một…"
      />,
    );
    expect(screen.getByText("Chọn một…")).toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("has aria-expanded and aria-haspopup attributes", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "listbox");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("closes dropdown and calls onChange on option click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Lựa chọn 1"));
    expect(onChange).toHaveBeenCalledWith("option1");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("does not call onChange for disabled option click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Lựa chọn 3"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes on outside click", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <span data-testid="outside">Bên ngoài</span>
        <Select options={options} value="" onChange={vi.fn()} />
      </div>,
    );
    await user.click(screen.getByRole("button", { name: undefined }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByTestId("outside"));
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("navigates options with ArrowUp", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={onChange} />);
    const button = screen.getByRole("button");
    await user.click(button);

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("option1");
  });

  it("ArrowUp skips disabled options", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const opts = [
      { key: "a", label: "A" },
      { key: "b", label: "B", disabled: true },
      { key: "c", label: "C" },
    ];
    render(<Select options={opts} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button"));

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("ArrowUp at top stays at top", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={onChange} />);
    await user.click(screen.getByRole("button"));

    await user.keyboard("{ArrowUp}");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("option1");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("opens dropdown via ArrowDown keyboard shortcut", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={vi.fn()} />);
    const button = screen.getByRole("button");
    button.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("disabled button prevents interaction", () => {
    render(
      <Select options={options} value="" onChange={vi.fn()} disabled />,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders listbox with ARIA role and id", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("id");
    expect(listbox.id).toContain("listbox");
  });

  it("marks selected option with aria-selected", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="option1" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    const optionsList = screen.getAllByRole("option");
    const selected = optionsList.find((opt) => opt.textContent === "Lựa chọn 1");
    expect(selected).toHaveAttribute("aria-selected", "true");
  });

  it("marks disabled option with aria-disabled", async () => {
    const user = userEvent.setup();
    render(<Select options={options} value="" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button"));
    const disabledOption = screen.getByText("Lựa chọn 3").closest('[role="option"]');
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  });
});
