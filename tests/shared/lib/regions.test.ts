import { describe, it, expect } from "vitest";
import { REGIONS, REGION_FILTER_OPTIONS } from "~/lib/constants";

describe("REGIONS constants", () => {
  it("should have correct Vietnamese labels for all regions", () => {
    expect(REGIONS.ba_ria).toBe("Bà Rịa");
    expect(REGIONS.nghia_thanh).toBe("Nghĩa Thành");
    expect(REGIONS.dong_nai).toBe("Đồng Nai");
    expect(REGIONS.vung_tau).toBe("Vũng Tàu");
    expect(REGIONS.hcm).toBe("Hồ Chí Minh");
    expect(REGIONS.long_dien).toBe("Long Điền");
    expect(REGIONS.phu_my).toBe("Phú Mỹ");
    expect(REGIONS.xuyen_moc).toBe("Xuyên Mộc");
    expect(REGIONS.ngai_giao).toBe("Ngãi Giao");
    expect(REGIONS.dat_do).toBe("Đất Đỏ");
  });

  it("should have REGION_FILTER_OPTIONS structured correctly", () => {
    expect(REGION_FILTER_OPTIONS[0]).toEqual({ key: "", label: "Tất cả khu vực" });
    expect(REGION_FILTER_OPTIONS.length).toBe(11);
    expect(REGION_FILTER_OPTIONS[1]).toEqual({ key: "ba_ria", label: "Bà Rịa" });
  });
});
