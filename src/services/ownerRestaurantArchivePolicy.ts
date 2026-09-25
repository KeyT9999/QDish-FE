export const buildOwnerRestaurantListPath = (period?: string, archived = false) => {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  if (archived) params.set('archived', 'true');
  const query = params.toString();
  return `/api/owner/restaurants${query ? `?${query}` : ''}`;
};

export const getNextActiveRestaurantId = (
  activeRestaurants: Array<{ id?: string; _id: string }>,
  currentRestaurantId: string
) => {
  const stillActive = activeRestaurants.find((restaurant) => (restaurant.id || restaurant._id) === currentRestaurantId);
  return stillActive?.id || stillActive?._id || activeRestaurants[0]?.id || activeRestaurants[0]?._id || null;
};

export const refreshOwnerRestaurantLists = async <T>(
  loadActive: () => Promise<T[]>,
  loadArchived: () => Promise<T[]>
) => {
  const [active, archived] = await Promise.allSettled([
    Promise.resolve().then(loadActive),
    Promise.resolve().then(loadArchived)
  ]);
  return { active, archived };
};
