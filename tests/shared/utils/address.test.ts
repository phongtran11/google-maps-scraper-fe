import { describe, expect, it } from "vitest";

import { groupDistrictsWithWards } from "~/shared/utils/address";

describe("groupDistrictsWithWards", () => {
  it("returns empty array for empty input", () => {
    expect(groupDistrictsWithWards([])).toEqual([]);
  });

  it("groups wards under their respective districts", () => {
    const input = [
      {
        districts: { id: 1, name: "Thành phố Vũng Tàu" },
        wards: { districtId: 1, id: 10, name: "Phường 1" },
      },
      {
        districts: { id: 1, name: "Thành phố Vũng Tàu" },
        wards: { districtId: 1, id: 11, name: "Phường 2" },
      },
      {
        districts: { id: 2, name: "Thành phố Bà Rịa" },
        wards: { districtId: 2, id: 20, name: "Phường Phước Trung" },
      },
    ];

    const expected = [
      {
        id: 1,
        name: "Thành phố Vũng Tàu",
        wards: [
          { id: 10, name: "Phường 1" },
          { id: 11, name: "Phường 2" },
        ],
      },
      {
        id: 2,
        name: "Thành phố Bà Rịa",
        wards: [{ id: 20, name: "Phường Phước Trung" }],
      },
    ];

    expect(groupDistrictsWithWards(input)).toEqual(expected);
  });

  it("handles districts with no wards", () => {
    const input = [
      {
        districts: { id: 3, name: "Huyện Côn Đảo" },
        wards: null,
      },
    ];

    const expected = [
      {
        id: 3,
        name: "Huyện Côn Đảo",
        wards: [],
      },
    ];

    expect(groupDistrictsWithWards(input)).toEqual(expected);
  });
});
