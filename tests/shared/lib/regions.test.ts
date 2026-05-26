import { describe, it, expect } from "vitest";
import { REGIONS, REGION_FILTER_OPTIONS } from "~/lib/constants";

describe("REGIONS constants", () => {
  it("should have correct Vietnamese labels for all regions", () => {
    expect(REGIONS.ba_ria).toBe("Bà Rịa");
    expect(REGIONS.chau_duc).toBe("Châu Đức");
    expect(REGIONS.dong_nai).toBe("Đồng Nai");
    expect(REGIONS.vung_tau).toBe("Vũng Tàu");
    expect(REGIONS.hcm).toBe("Hồ Chí Minh");
    expect(REGIONS.long_dat).toBe("Long Đất");
    expect(REGIONS.phu_my).toBe("Phú Mỹ");
    expect(REGIONS.xuyen_moc).toBe("Xuyên Mộc");
  });

  it("should have REGION_FILTER_OPTIONS structured correctly", () => {
    expect(REGION_FILTER_OPTIONS[0]).toEqual({ key: "", label: "Tất cả khu vực" });
    expect(REGION_FILTER_OPTIONS.length).toBe(9);
    expect(REGION_FILTER_OPTIONS[1]).toEqual({ key: "ba_ria", label: "Bà Rịa" });
  });
});
