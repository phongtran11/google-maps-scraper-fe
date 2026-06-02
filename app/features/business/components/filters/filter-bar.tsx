import { useState, useTransition } from "react";
import { useSearchParams } from "react-router";

import type { GroupedDistrict } from "~/shared/types";

import { Button, GroupedSelectCheckbox, Input } from "~/shared/components";
import { SearchIcon } from "~/shared/icons/search";
import { getStringParams } from "~/shared/utils";

interface FilterBarProps {
  districtsWithWard: GroupedDistrict[];
}

export function FilterBar({ districtsWithWard }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [wardIds, setWardIds] = useState<string[]>(() => getStringParams(searchParams, "wardId"));

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    startTransition(() => {
      const next = new URLSearchParams(searchParams);

      // handle search
      if (search) next.set("search", search);
      else next.delete("search");

      // handle wardIds
      if (wardIds.length > 0) {
        next.set("wardId", wardIds.join(","));
      } else {
        next.delete("wardId");
      }

      next.set("page", "1");

      setSearchParams(next);
    });
  };

  const groups = districtsWithWard.map((d) => ({
    key: String(d.id),
    label: d.name,
    options: d.wards.map((w) => ({
      key: String(w.id),
      label: w.name,
    })),
  }));

  return (
    <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
      <Input
        className="w-full sm:w-72 sm:max-w-xs"
        disabled={pending}
        inputSize="md"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm tên doanh nghiệp…"
        prefixIcon={<SearchIcon />}
        type="search"
        value={search}
      />

      <GroupedSelectCheckbox
        aria-label="Lọc theo khu vực"
        className="w-full sm:w-72"
        groups={groups}
        onChange={setWardIds}
        placeholder="Tất cả khu vực"
        selectSize="md"
        value={wardIds}
      />

      <Button className="w-full sm:w-auto" disabled={pending} type="submit">
        Tìm kiếm
      </Button>
    </form>
  );
}
