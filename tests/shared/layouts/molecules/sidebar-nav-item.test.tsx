import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { SidebarNavItem } from "~/shared/layouts/molecules/sidebar-nav-item";

describe("SidebarNavItem", () => {
  it("renders label and icon", () => {
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span data-testid="icon">🏠</span>} label="Trang chủ" to="/" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Trang chủ")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders as NavLink with correct href", () => {
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span>📊</span>} label="Dashboard" to="/dashboard" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Dashboard/ });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("applies active styles when on matching route", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <SidebarNavItem icon={<span>✓</span>} label="Active" to="/dashboard" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Active/ });
    expect(link.className).toContain("bg-primary/10");
    expect(link.className).toContain("text-primary");
  });

  it("applies normal styles when on non-matching route", () => {
    render(
      <MemoryRouter initialEntries={["/other"]}>
        <SidebarNavItem icon={<span>○</span>} label="Normal" to="/dashboard" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Normal/ });
    expect(link.className).not.toContain("bg-primary/10");
    expect(link.className).not.toContain("text-primary");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span>👆</span>} label="Clickable" onClick={onClick} to="/" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Clickable/ });
    link.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
