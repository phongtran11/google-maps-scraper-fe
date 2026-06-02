import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { AdminSidebar } from "~/shared/layouts/organisms/admin-sidebar";

vi.mock("~/shared/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

describe("AdminSidebar", () => {
  const user = { email: "test@example.com", image: null, name: "Test User" };

  it("renders brand link", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Quản lý Khách Hàng")).toBeInTheDocument();
  });

  it("renders dashboard nav item", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Trang Quản Trị")).toBeInTheDocument();
  });

  it("renders invite nav item", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Mời Thành Viên")).toBeInTheDocument();
  });

  it("highlights dashboard when on root path", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    const dashboardLink = screen.getByRole("link", { name: /Trang Quản Trị/ });
    expect(dashboardLink.className).toContain("bg-primary/10");
  });

  it("highlights dashboard when on business detail path", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/businesses/123" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    const dashboardLink = screen.getByRole("link", { name: /Trang Quản Trị/ });
    expect(dashboardLink.className).toContain("bg-primary/10");
  });

  it("does not render close button when onClose is not provided", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onClose={vi.fn()} onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    const closeButtons = screen.getAllByRole("button");
    const hasCloseButton = closeButtons.some((btn) => btn.querySelector("svg"));
    expect(hasCloseButton).toBe(true);
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const userEvt = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onClose={onClose} onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find((btn) => btn.querySelector("svg"));
    if (closeButton) {
      await userEvt.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("renders user profile section", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" onSignOut={vi.fn()} user={user} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
