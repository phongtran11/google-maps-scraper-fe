import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "~/shared/components/checkbox";

describe("Checkbox", () => {
  it("renders with a label", () => {
    render(<Checkbox label="Test Label" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("calls onChange when clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="Click Me" onChange={onChange} />);

    await user.click(screen.getByLabelText("Click Me"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="Disabled Checkbox" disabled onChange={onChange} />);

    const input = screen.getByLabelText("Disabled Checkbox");
    expect(input).toBeDisabled();

    // Workaround for testing-library which might still trigger click on disabled label
    await user.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("displays check icon when checked", () => {
    const { container } = render(<Checkbox checked label="Checked" readOnly />);
    // CheckIcon is rendered as svg within the checkbox container
    const svg = container.querySelector("svg.text-primary");
    expect(svg).toBeInTheDocument();
  });

  it("displays dash line and behaves as indeterminate when indeterminate is true", () => {
    const { container } = render(<Checkbox indeterminate label="Indeterminate" readOnly />);
    
    // An indeterminate checkbox should show a dash div, not a check icon SVG
    const svg = container.querySelector("svg.text-primary");
    expect(svg).not.toBeInTheDocument();

    const dash = container.querySelector("div.bg-primary");
    expect(dash).toBeInTheDocument();

    const input = screen.getByLabelText("Indeterminate") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });
});
