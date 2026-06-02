import { useState, useTransition } from "react";
import { useSearchParams } from "react-router";

import { Button, GroupedSelectCheckbox, Input } from "~/shared/components";
import { SearchIcon } from "~/shared/icons/search";
import type { GroupedDistrict } from "~/shared/types";

interface FilterBarProps {
  districtsWithWard: GroupedDistrict[];
}

export function FilterBar({ districtsWithWard }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [wardIds, setWardIds] = useState<string[]>(() => searchParams.getAll("wardId"));

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    startTransition(() => {
      const next = new URLSearchParams(searchParams);

      // handle search
      if (search) next.set("search", search);
      else next.delete("search");

      // handle wardIds
      next.delete("wardId");
      wardIds.forEach((id) => next.append("wardId", id));

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        type="search"
        placeholder="Tìm tên doanh nghiệp…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefixIcon={<SearchIcon />}
        inputSize="md"
        className="w-full sm:w-72 sm:max-w-xs"
        disabled={pending}
      />

      <GroupedSelectCheckbox
        groups={groups}
        value={wardIds}
        onChange={setWardIds}
        selectSize="md"
        className="w-full sm:w-72"
        placeholder="Tất cả khu vực"
        aria-label="Lọc theo khu vực"
        disabled={pending}
      />

      <Button disabled={pending} type="submit" className="w-full sm:w-auto">
        Tìm kiếm
      </Button>
    </form>
  );
}
