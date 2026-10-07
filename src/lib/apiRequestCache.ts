export function createApiGetRequestCacheKey(
  url: string,
  authScope: string,
  restaurantScope: string | null,
): string {
  return `${url}|${authScope}|${restaurantScope || 'no-restaurant'}`;
}
