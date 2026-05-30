import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { AdminSidebar } from "~/shared/layouts/admin-sidebar";

vi.mock("~/shared/hooks/useTheme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

describe("AdminSidebar", () => {
  const user = { name: "Test User", email: "test@example.com", image: null };

  it("renders brand link", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Quản lý Khách Hàng")).toBeInTheDocument();
  });

  it("renders dashboard nav item", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Trang Quản Trị")).toBeInTheDocument();
  });

  it("renders invite nav item", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Mời Thành Viên")).toBeInTheDocument();
  });

  it("highlights dashboard when on root path", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    const dashboardLink = screen.getByRole("link", { name: /Trang Quản Trị/ });
    expect(dashboardLink.className).toContain("bg-primary/10");
  });

  it("highlights dashboard when on business detail path", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/businesses/123" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    const dashboardLink = screen.getByRole("link", { name: /Trang Quản Trị/ });
    expect(dashboardLink.className).toContain("bg-primary/10");
  });

  it("does not render close button when onClose is not provided", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    render(
      <MemoryRouter>
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} onClose={vi.fn()} />
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
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} onClose={onClose} />
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
        <AdminSidebar currentPath="/" user={user} onSignOut={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
