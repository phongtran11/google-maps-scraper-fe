import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";

interface UseInfiniteScrollOptions<Item> {
  initialItems: Item[];
  pageSize: number;
  fetchUrl: (offset: number) => string;
  /** Changing this value resets fetcher state (e.g. area filter) */
  resetKey?: string;
}

export function useInfiniteScroll<Item>({
  initialItems,
  pageSize,
  fetchUrl,
  resetKey,
}: UseInfiniteScrollOptions<Item>) {
  const fetcher = useFetcher<{ businesses: Item[] }>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastResetKey = useRef(resetKey);

  if (lastResetKey.current !== resetKey) {
    lastResetKey.current = resetKey;
    fetcher.data = undefined;
  }

  const items = [
    ...initialItems,
    ...(resetKey === lastResetKey.current ? (fetcher.data?.businesses ?? []) : []),
  ];

  const fetcherReturnedLess =
    fetcher.data != null &&
    fetcher.data.businesses.length < pageSize;

  const hasMore =
    initialItems.length === pageSize && !fetcherReturnedLess;

  useEffect(() => {
    if (!hasMore) return;
    if (fetcher.state !== "idle") return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetcher.load(fetchUrl(items.length));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetcher.state, items.length, hasMore, fetchUrl]);

  return { items, sentinelRef, isFetching: fetcher.state === "loading" };
}
