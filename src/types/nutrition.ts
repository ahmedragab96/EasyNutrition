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
