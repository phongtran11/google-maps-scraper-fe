import { useState, useTransition } from "react";
import { useSearchParams } from "react-router";
import { Input, Select, Button } from "~/shared/components";
import { SearchIcon } from "~/shared/icons/search";
import { REGION_FILTER_OPTIONS } from "~/lib/constants";

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");

  const [region, setRegion] = useState(() => searchParams.get("region") || "");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    startTransition(() => {
      const next = new URLSearchParams(searchParams);

      if (search) next.set("search", search);
      else next.delete("search");

      if (region) next.set("region", region);
      else next.delete("region");

      next.set("page", "1");

      setSearchParams(next);
    });
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
        options={REGION_FILTER_OPTIONS}
        value={region}
        onChange={setRegion}
        selectSize="md"
        className="min-w-[180px]"
        aria-label="Lọc theo khu vực"
      />

      <Button loading={pending} type="submit">
        Lọc
      </Button>
    </form>
  );
}
