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
  /** Ingredient breakdown from AI analysis, e.g. "200g chicken, 150g rice" */
  description?: string;
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

export type FoodSource = 'ai_scan' | 'barcode' | 'manual_search' | 'system';

export type FoodItem = {
  id: string;
  name: string;
  description?: string;
  kcal: number;
  macros: Macros;
  servingSize?: number;
  servingUnit?: string;
  /** When true, kcal/macros are per piece and servingSize is grams per piece */
  isCountable: boolean;
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

// ─── Insights Types ───────────────────────────────────────────────────────────

export type InsightRating = 'good' | 'fair' | 'poor';

export type InsightSection = {
  id: string;
  title: string;
  rating: InsightRating;
  insight: string;
};

export type InsightsResult = {
  score: number;
  headline: string;
  sections: InsightSection[];
  recommendations: string[];
  bestWeekday?: string;
  currentStreak: number;
  bestStreak: number;
};

export type InsightsPayload = {
  goals: { kcal: number; protein: number; carbs: number; fats: number; waterMl: number };
  daysInMonth: number;
  daysLogged: number;
  days: Array<{
    date: string;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    mealsCount: number;
    waterMl: number;
  }>;
  topFoods: string[];
  month: string;
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
