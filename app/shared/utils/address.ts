import type { GroupedDistrict, DistrictRow, WardRow } from "~/shared/types";

export function groupDistrictsWithWards(
  rows: {
    districts: DistrictRow;
    wards: WardRow | null;
  }[]
): GroupedDistrict[] {
  const districtMap = new Map<number, GroupedDistrict>();

  for (const row of rows) {
    const d = row.districts;
    const w = row.wards;

    if (!districtMap.has(d.id)) {
      districtMap.set(d.id, {
        id: d.id,
        name: d.name,
        wards: [],
      });
    }

    if (w) {
      districtMap.get(d.id)!.wards.push({
        id: w.id,
        name: w.name,
      });
    }
  }

  return Array.from(districtMap.values());
}
