export interface DiningVisitStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export function getOrCreateDiningVisitToken(
  restaurantId: string,
  tableSessionId: string,
  storage: DiningVisitStorage = sessionStorage,
  randomUUID: () => string = () => crypto.randomUUID()
): string {
  const key = `qdish_visit:${restaurantId}:${tableSessionId}`;
  const existing = storage.getItem(key);
  if (existing) return existing;

  const token = randomUUID();
  storage.setItem(key, token);
  return token;
}
