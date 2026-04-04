// ─── Nutrition Domain Types ──────────────────────────────────────────────────

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export type Macros = {
  /** grams */
  protein: number;
  /** grams */
  carbs: number;
  /** grams */
  fats: number;
};

export type MacroGoal = {
  consumed: number;
  goal: number;
};

export type Meal = {
  id: string;
  name: string;
  /** Display time e.g. "8:30 AM" */
  time: string;
  type: MealType;
  /** kcal total */
  kcal: number;
  macros: Macros;
};

export type DayLog = {
  /** YYYY-MM-DD */
  dateId: string;
  caloriesConsumed: number;
  caloriesGoal: number;
  meals: Meal[];
};

export type UserProfile = {
  id: string;
  displayName?: string;
  calorieGoal: number;
  macroGoals: Macros;
  createdAt: string;
  updatedAt: string;
};

export type FoodSource = 'ai_scan' | 'manual_search' | 'system';

export type FoodItem = {
  id: string;
  name: string;
  description?: string;
  kcal: number;
  macros: Macros;
  servingSize?: number;
  servingUnit?: string;
  category?: string;
  source: FoodSource;
  aiConfidence?: number;
  createdBy?: string;
  isPublic: boolean;
  createdAt: string;
};

export type MealLog = {
  id: string;
  userId: string;
  foodItemId: string;
  mealType: MealType;
  /** YYYY-MM-DD */
  dateId: string;
  loggedAt: string;
  quantity: number;
  snapshot: { kcal: number } & Macros;
  notes?: string;
};

export type DailySummary = {
  caloriesConsumed: number;
  caloriesGoal: number;
  /** kcal burned through exercise */
  caloriesBurned: number;
  macros: {
    protein: MacroGoal;
    carbs: MacroGoal;
    fats: MacroGoal;
  };
};
