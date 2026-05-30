import { useState, useTransition } from "react";
import { useSearchParams } from "react-router";
import { Input, GroupedSelectCheckbox, Button } from "~/shared/components";
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

      if (search) next.set("search", search);
      else next.delete("search");

      // Clear existing wardId params and append the newly selected ones
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <Input
        type="search"
        placeholder="Tìm tên doanh nghiệp…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefixIcon={<SearchIcon />}
        inputSize="md"
        className="max-w-xs min-w-[200px]"
      />

      <GroupedSelectCheckbox
        groups={groups}
        value={wardIds}
        onChange={setWardIds}
        selectSize="md"
        className="min-w-[220px]"
        placeholder="Tất cả khu vực"
        aria-label="Lọc theo khu vực"
      />

      <Button size="sm" disabled={pending} type="submit">
        Tìm kiếm
      </Button>
    </form>
  );
}
