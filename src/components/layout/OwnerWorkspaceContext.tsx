import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type OwnerWorkspaceSelectionStatus = 'loading' | 'ready' | 'empty';

interface OwnerWorkspaceContextValue {
  selectedRestId: string;
  selectionStatus: OwnerWorkspaceSelectionStatus;
  resolveSelectedRestaurant: (restaurantId: string | null) => void;
}

const OwnerWorkspaceContext = createContext<OwnerWorkspaceContextValue | null>(null);

const readStoredRestaurantId = () => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('selected_restaurant_id') || '';
};

export const OwnerWorkspaceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedRestId, setSelectedRestId] = useState(readStoredRestaurantId);
  const [selectionStatus, setSelectionStatus] = useState<OwnerWorkspaceSelectionStatus>('loading');

  const resolveSelectedRestaurant = useCallback((restaurantId: string | null) => {
    if (restaurantId) {
      window.localStorage.setItem('selected_restaurant_id', restaurantId);
      setSelectedRestId(restaurantId);
      setSelectionStatus('ready');
      return;
    }

    window.localStorage.removeItem('selected_restaurant_id');
    setSelectedRestId('');
    setSelectionStatus('empty');
  }, []);

  const value = useMemo(() => ({
    selectedRestId,
    selectionStatus,
    resolveSelectedRestaurant
  }), [resolveSelectedRestaurant, selectedRestId, selectionStatus]);

  return (
    <OwnerWorkspaceContext.Provider value={value}>
      {children}
    </OwnerWorkspaceContext.Provider>
  );
};

export const useOwnerWorkspace = () => {
  const context = useContext(OwnerWorkspaceContext);
  if (!context) {
    throw new Error('useOwnerWorkspace must be used within OwnerWorkspaceProvider');
  }
  return context;
};
