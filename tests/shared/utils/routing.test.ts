import { describe, expect, it } from "vitest";

import type { RouteMatch } from "~/shared/types";
import { getBreadcrumbs } from "~/shared/utils/routing";

describe("getBreadcrumbs", () => {
  it("returns single dashboard crumb for root path", () => {
    const result = getBreadcrumbs("/", []);
    expect(result).toEqual([{ label: "Trang Quản Trị" }]);
  });

  it("returns dashboard + business name for business detail path", () => {
    const matches: RouteMatch[] = [
      {
        id: "routes/businesses.$id",
        pathname: "/businesses/123",
        params: { id: "123" },
        loaderData: { business: { business_name: "Cafe ABC" } },
      },
    ];
    const result = getBreadcrumbs("/businesses/123", matches);
    expect(result).toEqual([{ label: "Trang Quản Trị", to: "/" }, { label: "Cafe ABC" }]);
  });

  it("returns fallback label when business name is missing", () => {
    const matches: RouteMatch[] = [
      {
        id: "routes/businesses.$id",
        pathname: "/businesses/123",
        params: { id: "123" },
        loaderData: { business: {} },
      },
    ];
    const result = getBreadcrumbs("/businesses/123", matches);
    expect(result).toEqual([
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi tiết doanh nghiệp" },
    ]);
  });

  it("returns fallback label when loaderData has no business", () => {
    const matches: RouteMatch[] = [
      {
        id: "routes/businesses.$id",
        pathname: "/businesses/123",
        params: { id: "123" },
        loaderData: undefined,
      },
    ];
    const result = getBreadcrumbs("/businesses/123", matches);
    expect(result).toEqual([
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi tiết doanh nghiệp" },
    ]);
  });

  it("returns fallback when matching route id is not found", () => {
    const matches: RouteMatch[] = [
      {
        id: "routes/other",
        pathname: "/businesses/123",
        params: {},
        loaderData: null,
      },
    ];
    const result = getBreadcrumbs("/businesses/123", matches);
    expect(result).toEqual([
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi tiết doanh nghiệp" },
    ]);
  });

  it('returns generic "Chi tiết" for unknown non-root paths', () => {
    const result = getBreadcrumbs("/some/other/path", []);
    expect(result).toEqual([{ label: "Trang Quản Trị", to: "/" }, { label: "Chi tiết" }]);
  });
});
