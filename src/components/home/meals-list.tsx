/**
 * MealsList — "Recent Meals" section with header and a list of MealCard items.
 *
 * Design rules (DESIGN.md):
 *  - No dividers — 1.5rem (Spacing.six = 24px) vertical gap between cards
 *  - "View Diary" link in secondary color
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MealCard } from './meal-card';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Spacing,
} from '@/constants/theme';
import { Meal } from '@/types/nutrition';

// ─── MealsList ────────────────────────────────────────────────────────────────

type MealsListProps = {
  meals: Meal[];
  onViewDiary?: () => void;
  onMealPress?: (meal: Meal) => void;
};

export function MealsList({ meals, onViewDiary, onMealPress }: MealsListProps) {
  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Meals</Text>
        <Pressable
          onPress={onViewDiary}
          android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 40 }}
          style={styles.viewDiaryBtn}
        >
          <Text style={styles.viewDiaryLabel}>View Diary</Text>
        </Pressable>
      </View>

      {/* Meal cards — no dividers, spacing only */}
      <View style={styles.list}>
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={() => onMealPress?.(meal)}
          />
        ))}

        {meals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🥗</Text>
            <Text style={styles.emptyText}>No meals logged yet today</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleMd,
  },
  viewDiaryBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  viewDiaryLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.secondary,
    lineHeight: LineHeight.bodyMd,
  },

  // List — Spacing.six (24px) between cards per DESIGN.md "no dividers" rule
  list: {
    gap: Spacing.six,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.ten,
    gap: Spacing.three,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
});
