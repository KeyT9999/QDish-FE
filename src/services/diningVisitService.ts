import { apiFetch } from './api';

export interface RecordDiningVisitInput {
  restaurantId: string;
  tableSessionId: string;
  visitToken: string;
  goals: string[];
  dietaryPreferences: string[];
}

export interface RecordDiningVisitResponse {
  id: string;
  recordedAt: string;
  created: boolean;
}

export const recordDiningVisit = (input: RecordDiningVisitInput) => {
  return apiFetch<RecordDiningVisitResponse>(
    `/api/restaurants/${input.restaurantId}/dining-visits`,
    {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify({
        tableSessionId: input.tableSessionId,
        visitToken: input.visitToken,
        goals: input.goals,
        dietaryPreferences: input.dietaryPreferences
      })
    }
  );
};
