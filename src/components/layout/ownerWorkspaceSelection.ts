export interface OwnerRestaurantSelectionCandidate {
  id?: string;
  _id?: string;
}

const getRestaurantId = (restaurant: OwnerRestaurantSelectionCandidate) => (
  restaurant.id || restaurant._id || ''
);

export const resolveOwnerRestaurantSelection = (
  restaurants: OwnerRestaurantSelectionCandidate[],
  storedRestaurantId: string | null | undefined
): string | null => {
  const storedId = storedRestaurantId?.trim() || '';
  const storedRestaurant = restaurants.find((restaurant) => getRestaurantId(restaurant) === storedId);
  if (storedRestaurant) return getRestaurantId(storedRestaurant);

  const firstRestaurant = restaurants.find((restaurant) => getRestaurantId(restaurant));
  return firstRestaurant ? getRestaurantId(firstRestaurant) : null;
};
