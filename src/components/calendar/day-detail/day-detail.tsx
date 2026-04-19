import { Ionicons } from '@expo/vector-icons';
import { fromDateId } from '@marceloterreiro/flash-calendar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { MealGroup } from '@/components/calendar/meal-group';
import { Colors, FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { DailySummary, Meal } from '@/types/nutrition';

const MEAL_TYPE_ORDER: Meal['type'][] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export type DayDetailProps = {
  dateId: string;
  meals: Meal[];
  summary: DailySummary;
  loading: boolean;
};

export function DayDetail({ dateId, meals, summary, loading }: DayDetailProps) {
  const date = fromDateId(dateId);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const heading = `${weekday}, ${monthDay}`;
  const hasData = summary.caloriesConsumed > 0;
  const percent = hasData
    ? Math.round((summary.caloriesConsumed / summary.caloriesGoal) * 100)
    : 0;

  const groups = MEAL_TYPE_ORDER
    .map((type) => ({ type, meals: meals.filter((m) => m.type === type) }))
    .filter((g) => g.meals.length > 0);

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>{heading}</Text>
          {!loading && hasData && (
            <Text style={styles.targetLine}>
              You've reached{' '}
              <Text style={styles.targetPct}>{percent}%</Text>
              {' '}of your daily target.
            </Text>
          )}
        </View>
        <View style={styles.iconBadge}>
          <Ionicons name="restaurant-outline" size={18} color={Colors.onSurfaceVariant} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <>
          {hasData && (
            <View style={styles.statsRow}>
              <StatChip label="KCAL"    value={summary.caloriesConsumed}       goal={summary.caloriesGoal}             unit=""  highlight />
              <StatChip label="PROTEIN" value={summary.macros.protein.consumed} goal={summary.macros.protein.goal} unit="g" />
              <StatChip label="CARBS"   value={summary.macros.carbs.consumed}   goal={summary.macros.carbs.goal}   unit="g" />
              <StatChip label="FATS"    value={summary.macros.fats.consumed}    goal={summary.macros.fats.goal}    unit="g" />
            </View>
          )}

          {groups.length > 0 ? (
            <View style={styles.mealList}>
              {groups.map(({ type, meals: groupMeals }) => (
                <MealGroup key={type} type={type} meals={groupMeals} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🥗</Text>
              <Text style={styles.emptyText}>No meals logged for this day.</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── StatChip ─────────────────────────────────────────────────────────────────

type StatChipProps = { label: string; value: number; goal: number; unit: string; highlight?: boolean };

function StatChip({ label, value, goal, unit, highlight }: StatChipProps) {
  return (
    <View style={[chipStyles.chip, highlight && chipStyles.chipHighlight]}>
      <Text style={[chipStyles.value, highlight && chipStyles.valueHighlight]}>
        {value}{unit}
      </Text>
      <Text style={[chipStyles.goal, highlight && chipStyles.goalHighlight]}>
        / {goal}{unit}
      </Text>
      <Text style={[chipStyles.label, highlight && chipStyles.labelHighlight]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    gap: 1,
  },
  chipHighlight: { backgroundColor: Colors.primaryContainer },
  value: {
    fontSize: FontSize.labelMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  valueHighlight: { color: Colors.onPrimaryContainer },
  goal: {
    fontSize: 9,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  goalHighlight: { color: Colors.onPrimaryContainer },
  label: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  labelHighlight: { color: Colors.onPrimaryContainer },
});

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.five,
    gap: Spacing.four,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  heading: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleLg,
  },
  targetLine: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
  targetPct: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { paddingVertical: Spacing.four },
  mealList: { gap: Spacing.two },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
});
