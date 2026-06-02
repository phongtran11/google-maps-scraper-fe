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

  it("applies active styles when isActive is true", () => {
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span>✓</span>} isActive label="Active" to="/" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Active/ });
    expect(link.className).toContain("bg-primary/10");
    expect(link.className).toContain("text-primary");
  });

  it("applies normal styles when not active", () => {
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span>○</span>} label="Normal" to="/" />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Normal/ });
    expect(link.className).toContain("text-muted-foreground");
    expect(link.className).not.toContain("bg-primary/10");
  });

  it("renders as div with upcoming badge when isUpcoming", () => {
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span>🔜</span>} isUpcoming label="Tính năng mới" to="/soon" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Tính năng mới")).toBeInTheDocument();
    expect(screen.getByText("Sắp có")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("applies upcoming styles when isUpcoming", () => {
    render(
      <MemoryRouter>
        <SidebarNavItem icon={<span>🔜</span>} isUpcoming label="Upcoming" to="/" />
      </MemoryRouter>,
    );
    const container = screen.getByText("Upcoming").closest("div")?.parentElement;
    expect(container?.className).toContain("text-muted-foreground/45");
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
