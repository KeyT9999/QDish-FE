import { useState } from 'react';
import { Role } from '@/types';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/services/api';
import { disconnectRealtimeSocket } from '@/services/realtimeService';

interface User {
  role: Role;
  restaurantId?: string;
  id?: string;
  username?: string;
  email?: string;
}

const decodeUserFromToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      role: payload.role,
      restaurantId: payload.restaurantId,
      id: payload.id || payload.sub,
      username: payload.username,
      email: payload.email
    };
  } catch {
    return null;
  }
};

const getInitialUser = (): User | null => {
  const token = getAuthToken();
  if (!token) return null;

  const decodedUser = decodeUserFromToken(token);
  if (!decodedUser) {
    removeAuthToken();
  }
  return decodedUser;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getInitialUser());
  const [isLoading] = useState(false);

  const login = (token: string) => {
    localStorage.removeItem('selected_restaurant_id');
    setAuthToken(token);
    const decodedUser = decodeUserFromToken(token);
    setUser(decodedUser);
    return decodedUser?.role || null;
  };

  const logout = () => {
    localStorage.removeItem('selected_restaurant_id');
    disconnectRealtimeSocket();
    removeAuthToken();
    setUser(null);
  };

  return { user, isLoading, login, logout };
}
