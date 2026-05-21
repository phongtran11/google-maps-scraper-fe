import { useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "~/shared/components/input";
import { Select } from "~/shared/components/select";
import { Button } from "~/shared/components/button";
import { SearchIcon } from "~/shared/icons/search";
import { AREA_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "~/lib/constants";

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(
    () => searchParams.get("search") || "",
  );

  const [area, setArea] = useState(() => searchParams.get("area") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);

    if (search) next.set("search", search);
    else next.delete("search");

    if (area) next.set("area", area);
    else next.delete("area");

    next.set("page", "1");

    setSearchParams(next);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <Input
        type="search"
        placeholder="Tìm tên doanh nghiệp…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefixIcon={<SearchIcon />}
        inputSize="md"
        className="min-w-[200px] max-w-xs"
      />


      <Select
        options={AREA_FILTER_OPTIONS}
        value={area}
        onChange={setArea}
        selectSize="md"
        className="min-w-[180px]"
        aria-label="Lọc theo khu vực"
      />

      <Button type="submit">
        Lọc
      </Button>
    </form>
  );
}
