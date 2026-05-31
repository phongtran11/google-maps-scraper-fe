import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProfile } from "~/shared/layouts/molecules/sidebar-profile";

vi.mock("~/shared/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

describe("SidebarProfile", () => {
  const user = { name: "Nguyễn Văn A", email: "nguyen@example.com", image: null };

  it("renders user name and email", () => {
    render(<SidebarProfile user={user} onSignOut={vi.fn()} />);
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("nguyen@example.com")).toBeInTheDocument();
  });

  it("renders avatar image when user has image", () => {
    const userWithImage = { ...user, image: "https://example.com/avatar.jpg" };
    render(<SidebarProfile user={userWithImage} onSignOut={vi.fn()} />);
    const img = screen.getByRole("img", { name: "Nguyễn Văn A" });
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders initial when user has no image", () => {
    render(<SidebarProfile user={user} onSignOut={vi.fn()} />);
    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("renders sign-out button", () => {
    render(<SidebarProfile user={user} onSignOut={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Đăng Xuất/ })).toBeInTheDocument();
  });

  it("calls onSignOut when button is clicked", async () => {
    const onSignOut = vi.fn();
    const userEvt = userEvent.setup();
    render(<SidebarProfile user={user} onSignOut={onSignOut} />);
    await userEvt.click(screen.getByRole("button", { name: /Đăng Xuất/ }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("renders theme toggle", () => {
    render(<SidebarProfile user={user} onSignOut={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Chuyển sang/ })).toBeInTheDocument();
  });
});
