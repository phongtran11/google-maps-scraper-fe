import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SidebarProfile } from "~/shared/layouts/molecules/sidebar-profile";

vi.mock("~/shared/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

describe("SidebarProfile", () => {
  const user = { email: "nguyen@example.com", image: null, name: "Nguyễn Văn A" };

  it("renders user name and email", () => {
    render(<SidebarProfile onSignOut={vi.fn()} user={user} />);
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("nguyen@example.com")).toBeInTheDocument();
  });

  it("renders avatar image when user has image", () => {
    const userWithImage = { ...user, image: "https://example.com/avatar.jpg" };
    render(<SidebarProfile onSignOut={vi.fn()} user={userWithImage} />);
    const img = screen.getByRole("img", { name: "Nguyễn Văn A" });
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders initial when user has no image", () => {
    render(<SidebarProfile onSignOut={vi.fn()} user={user} />);
    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("renders sign-out button", () => {
    render(<SidebarProfile onSignOut={vi.fn()} user={user} />);
    expect(screen.getByRole("button", { name: /Đăng Xuất/ })).toBeInTheDocument();
  });

  it("calls onSignOut when button is clicked", async () => {
    const onSignOut = vi.fn();
    const userEvt = userEvent.setup();
    render(<SidebarProfile onSignOut={onSignOut} user={user} />);
    await userEvt.click(screen.getByRole("button", { name: /Đăng Xuất/ }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders theme toggle", () => {
    render(<SidebarProfile onSignOut={vi.fn()} user={user} />);
    expect(screen.getByRole("button", { name: /Chuyển sang/ })).toBeInTheDocument();
  });
});
