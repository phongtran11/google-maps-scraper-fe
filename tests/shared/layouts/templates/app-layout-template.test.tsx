import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { BreadcrumbItem } from "~/shared/types";

import { AppLayoutTemplate } from "~/shared/layouts/templates/app-layout-template";

vi.mock("~/shared/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

describe("AppLayoutTemplate", () => {
  const currentUser = { email: "test@example.com", image: null, name: "Test User" };
  const onSignOut = vi.fn();

  it("renders children content", () => {
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị" }]}
          currentPath="/"
          currentUser={currentUser}
          isRoot
          onSignOut={onSignOut}
        >
          <div>Nội dung trang</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    expect(screen.getByText("Nội dung trang")).toBeInTheDocument();
  });

  it("renders breadcrumbs", () => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi tiết doanh nghiệp" },
    ];
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={breadcrumbs}
          currentPath="/businesses/123"
          currentUser={currentUser}
          isRoot={false}
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    const breadcrumbLinks = screen.getAllByText("Trang Quản Trị");
    expect(breadcrumbLinks.length).toBeGreaterThan(0);
    expect(screen.getByText("Chi tiết doanh nghiệp")).toBeInTheDocument();
  });

  it("renders breadcrumb links with correct href", () => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi tiết" },
    ];
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={breadcrumbs}
          currentPath="/businesses/123"
          currentUser={currentUser}
          isRoot={false}
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    const links = screen.getAllByRole("link", { name: "Trang Quản Trị" });
    const breadcrumbLink = links.find((link) => link.className.includes("truncate"));
    expect(breadcrumbLink).toHaveAttribute("href", "/");
  });

  it("does not render back button when isRoot is true", () => {
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị" }]}
          currentPath="/"
          currentUser={currentUser}
          isRoot
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    expect(screen.queryByRole("button", { name: /Quay lại/ })).not.toBeInTheDocument();
  });

  it("renders back button when isRoot is false", () => {
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị", to: "/" }, { label: "Chi tiết" }]}
          currentPath="/businesses/123"
          currentUser={currentUser}
          isRoot={false}
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /Quay lại/ })).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị" }]}
          currentPath="/"
          currentUser={currentUser}
          isRoot
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /Open menu/ })).toBeInTheDocument();
  });

  it("renders user avatar in mobile header when image exists", () => {
    const userWithImage = { ...currentUser, image: "https://example.com/avatar.jpg" };
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị" }]}
          currentPath="/"
          currentUser={userWithImage}
          isRoot
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    const images = screen.getAllByRole("img", { name: "Test User" });
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders user initial in mobile header when no image", () => {
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị" }]}
          currentPath="/"
          currentUser={currentUser}
          isRoot
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    const initials = screen.getAllByText("T");
    expect(initials.length).toBeGreaterThan(0);
  });

  it("opens mobile sidebar when menu button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AppLayoutTemplate
          breadcrumbs={[{ label: "Trang Quản Trị" }]}
          currentPath="/"
          currentUser={currentUser}
          isRoot
          onSignOut={onSignOut}
        >
          <div>Content</div>
        </AppLayoutTemplate>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /Open menu/ }));
    const sidebars = screen.getAllByText("Quản lý Khách Hàng");
    expect(sidebars.length).toBeGreaterThan(0);
  });
});
