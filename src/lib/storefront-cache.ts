import { unstable_cache } from "next/cache";

export const STOREFRONT_CACHE_TAG = "storefront-data";

export function cacheStorefront<Args extends unknown[], Result>(
  key: string,
  load: (...args: Args) => Promise<Result>,
) {
  return unstable_cache(load, [key], { tags: [STOREFRONT_CACHE_TAG], revalidate: 60 });
}
