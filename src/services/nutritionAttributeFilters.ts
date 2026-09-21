export type NutritionFilterId =
  | 'UNDER_400_KCAL'
  | 'HIGH_PROTEIN'
  | 'LOW_CARB'
  | 'LOW_FAT'
  | 'LOW_SUGAR'
  | 'LOW_SODIUM'
  | 'HIGH_FIBER';

interface NutritionFilterItem {
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  nutritionComplete?: boolean;
  foodAttributes?: string[];
}

function value(item: NutritionFilterItem, key: keyof NonNullable<NutritionFilterItem['nutrition']>): number {
  return item.nutrition?.[key] ?? item[key] ?? 0;
}

function hasCompleteNutrition(item: NutritionFilterItem): boolean {
  return item.nutritionComplete === true;
}

export function hasCanonicalFoodAttribute(item: NutritionFilterItem, attribute: string): boolean {
  if (!hasCompleteNutrition(item)) return false;
  if (item.foodAttributes?.includes(attribute)) return true;

  switch (attribute) {
    case 'HIGH_PROTEIN':
      return value(item, 'protein') >= 25;
    case 'HIGH_FIBER':
      return value(item, 'fiber') >= 6;
    case 'LOW_SUGAR':
      return value(item, 'sugar') <= 5;
    case 'LOW_CALORIE': {
      const calories = value(item, 'calories');
      return calories > 0 && calories <= 400;
    }
    case 'LOW_FAT': {
      const calories = value(item, 'calories');
      return calories > 0 && value(item, 'fat') <= 10;
    }
    default:
      return false;
  }
}

export function matchesNutritionFilter(item: NutritionFilterItem, filter: NutritionFilterId): boolean {
  if (!hasCompleteNutrition(item)) return false;

  switch (filter) {
    case 'UNDER_400_KCAL':
      return hasCanonicalFoodAttribute(item, 'LOW_CALORIE');
    case 'HIGH_PROTEIN':
      return hasCanonicalFoodAttribute(item, 'HIGH_PROTEIN');
    case 'LOW_FAT':
      return hasCanonicalFoodAttribute(item, 'LOW_FAT');
    case 'LOW_SUGAR':
      return hasCanonicalFoodAttribute(item, 'LOW_SUGAR');
    case 'HIGH_FIBER':
      return hasCanonicalFoodAttribute(item, 'HIGH_FIBER');
    case 'LOW_CARB': {
      const carbs = value(item, 'carbs');
      return carbs > 0 && carbs <= 20;
    }
    case 'LOW_SODIUM': {
      const sodium = value(item, 'sodium');
      return sodium > 0 && sodium <= 140;
    }
  }
}
