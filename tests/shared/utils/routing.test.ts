import { describe, expect, it } from "vitest";

import type { RouteHandle, RouteMatch } from "~/shared/types";

import { collectBreadcrumbs } from "~/shared/utils/routing";

function makeMatch(overrides: Partial<RouteMatch> = {}): RouteMatch {
  return {
    handle: undefined,
    id: "routes/test",
    loaderData: undefined,
    params: {},
    pathname: "/",
    ...overrides,
  };
}

describe("collectBreadcrumbs", () => {
  it("returns empty array when no matches have breadcrumb handle", () => {
    const matches: RouteMatch[] = [makeMatch()];
    expect(collectBreadcrumbs(matches)).toEqual([]);
  });

  it("collects breadcrumbs from matches with handle.breadcrumb", () => {
    const handle: RouteHandle = { breadcrumb: () => "Trang Quản Trị" };
    const matches: RouteMatch[] = [makeMatch({ handle, pathname: "/" })];
    expect(collectBreadcrumbs(matches)).toEqual([{ label: "Trang Quản Trị" }]);
  });

  it("resolves dynamic label from loader data", () => {
    const handle: RouteHandle = {
      breadcrumb: (data) => {
        const d = data as { business?: { businessName?: string } };
        return d.business?.businessName ?? "Chi Tiết";
      },
    };
    const matches: RouteMatch[] = [
      makeMatch({
        handle: { breadcrumb: () => "Trang Quản Trị" },
        pathname: "/",
      }),
      makeMatch({
        handle,
        loaderData: { business: { businessName: "Cafe ABC" } },
        pathname: "/businesses/123",
      }),
    ];
    expect(collectBreadcrumbs(matches)).toEqual([
      { label: "Trang Quản Trị", to: "/" },
      { label: "Cafe ABC" },
    ]);
  });

  it("uses fallback when loader data is missing", () => {
    const handle: RouteHandle = {
      breadcrumb: (data) => {
        const d = (data ?? {}) as { business?: { businessName?: string } };
        return d.business?.businessName ?? "Chi Tiết";
      },
    };
    const matches: RouteMatch[] = [
      makeMatch({
        handle: { breadcrumb: () => "Trang Quản Trị" },
        pathname: "/",
      }),
      makeMatch({ handle, pathname: "/businesses/123" }),
    ];
    expect(collectBreadcrumbs(matches)).toEqual([
      { label: "Trang Quản Trị", to: "/" },
      { label: "Chi Tiết" },
    ]);
  });

  it("last breadcrumb has no link (current page)", () => {
    const matches: RouteMatch[] = [
      makeMatch({ handle: { breadcrumb: () => "A" }, pathname: "/a" }),
      makeMatch({ handle: { breadcrumb: () => "B" }, pathname: "/a/b" }),
      makeMatch({ handle: { breadcrumb: () => "C" }, pathname: "/a/b/c" }),
    ];
    const result = collectBreadcrumbs(matches);
    expect(result[0]).toHaveProperty("to", "/a");
    expect(result[1]).toHaveProperty("to", "/a/b");
    expect(result[2]).not.toHaveProperty("to");
  });

  it("skips matches without breadcrumb handle", () => {
    const matches: RouteMatch[] = [
      makeMatch({ pathname: "/" }), // no handle — skipped
      makeMatch({ handle: { breadcrumb: () => "Page" }, pathname: "/page" }),
    ];
    expect(collectBreadcrumbs(matches)).toEqual([{ label: "Page" }]);
  });
});
