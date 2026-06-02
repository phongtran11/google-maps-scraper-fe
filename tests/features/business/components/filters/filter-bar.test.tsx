import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";

import type { GroupedDistrict } from "~/shared/types";

import { FilterBar } from "~/features/business";

const mockDistrictsWithWard: GroupedDistrict[] = [
  {
    id: 1,
    name: "Huyện Châu Đức",
    wards: [
      { id: 101, name: "Xã Xuân Sơn" },
      { id: 102, name: "Xã Láng Lớn" },
    ],
  },
  {
    id: 2,
    name: "Thành phố Vũng Tàu",
    wards: [
      { id: 201, name: "Phường 1" },
      { id: 202, name: "Phường 2" },
    ],
  },
];

// Helper component to inspect search params in tests
function SearchParamsInspector({
  onParamsChange,
}: {
  onParamsChange: (params: URLSearchParams) => void;
}) {
  const [params] = useSearchParams();
  onParamsChange(params);
  return null;
}

describe("FilterBar", () => {
  it("renders search input, grouped select dropdown, and search button", () => {
    render(
      <MemoryRouter>
        <FilterBar districtsWithWard={mockDistrictsWithWard} />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText("Tìm tên doanh nghiệp…")).toBeInTheDocument();
    expect(screen.getByLabelText("Lọc theo khu vực")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tìm kiếm" })).toBeInTheDocument();
  });

  it("updates state on input change and submits new query parameter", async () => {
    const user = userEvent.setup();
    let currentParams = new URLSearchParams();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <SearchParamsInspector
          onParamsChange={(params) => {
            currentParams = params;
          }}
        />
        <FilterBar districtsWithWard={mockDistrictsWithWard} />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText("Tìm tên doanh nghiệp…");
    await user.type(input, "Spa");

    const submitButton = screen.getByRole("button", { name: "Tìm kiếm" });
    await user.click(submitButton);

    expect(currentParams.get("search")).toBe("Spa");
    expect(currentParams.get("page")).toBe("1");
  });

  it("applies multiple selected wards to searchParams on submit", async () => {
    const user = userEvent.setup();
    let currentParams = new URLSearchParams();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <SearchParamsInspector
          onParamsChange={(params) => {
            currentParams = params;
          }}
        />
        <FilterBar districtsWithWard={mockDistrictsWithWard} />
      </MemoryRouter>,
    );

    // Open select dropdown
    const selectTrigger = screen.getByLabelText("Lọc theo khu vực");
    await user.click(selectTrigger);

    // Select "Xã Xuân Sơn" (belonging to active tab Châu Đức)
    await user.click(screen.getByText("Xã Xuân Sơn"));

    // Switch to Vũng Tàu tab
    await user.click(screen.getByText("Thành phố Vũng Tàu"));
    // Select "Phường 1"
    await user.click(screen.getByText("Phường 1"));

    // Click Apply in the popover
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    // Click submit/Tìm kiếm button in the FilterBar
    const submitButton = screen.getByRole("button", { name: "Tìm kiếm" });
    await user.click(submitButton);

    expect(currentParams.get("wardId")).toBe("101,201");
    expect(currentParams.get("page")).toBe("1");
  });

  it("clears search query and ward selection when submitting empty inputs", async () => {
    const user = userEvent.setup();
    let currentParams = new URLSearchParams();

    render(
      <MemoryRouter initialEntries={["/?search=Spa&wardId=101&wardId=201"]}>
        <SearchParamsInspector
          onParamsChange={(params) => {
            currentParams = params;
          }}
        />
        <FilterBar districtsWithWard={mockDistrictsWithWard} />
      </MemoryRouter>,
    );

    // Clear search input
    const input = screen.getByPlaceholderText("Tìm tên doanh nghiệp…");
    await user.clear(input);

    // Open select dropdown and deselect wards
    const selectTrigger = screen.getByLabelText("Lọc theo khu vực");
    await user.click(selectTrigger);

    // Deselect Xã Xuân Sơn (active tab)
    await user.click(screen.getByText("Xã Xuân Sơn"));

    // Switch tab and deselect Phường 1
    await user.click(screen.getByText("Thành phố Vũng Tàu"));
    await user.click(screen.getByText("Phường 1"));

    // Click Apply
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    // Click submit
    const submitButton = screen.getByRole("button", { name: "Tìm kiếm" });
    await user.click(submitButton);

    expect(currentParams.get("search")).toBeNull();
    expect(currentParams.getAll("wardId")).toEqual([]);
    expect(currentParams.get("page")).toBe("1");
  });
});
