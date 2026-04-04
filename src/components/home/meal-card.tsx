/**
 * MealCard — individual logged meal entry.
 * No images per product spec. Shows name, time, kcal, and macros.
 *
 * Design rules (DESIGN.md):
 *  - No dividers — 1.5rem vertical white space separates items
 *  - On tap: surface-container-low → surface-container-lowest (haptic visual)
 *  - Min border radius: Radius.md (16px)
 *  - Label-SM for timestamps/units (onSurfaceVariant)
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { Meal, MealType } from '@/types/nutrition';

// ─── Meal type accent mapping ─────────────────────────────────────────────────

const MEAL_TYPE_COLOR: Record<MealType, string> = {
  BREAKFAST: Colors.secondary,
  LUNCH: Colors.primary,
  DINNER: Colors.onSurface,
  SNACK: Colors.tertiary,
};

// ─── Macro chip ───────────────────────────────────────────────────────────────

type MacroChipProps = { label: string; value: number };

function MacroChip({ label, value }: MacroChipProps) {
  return (
    <View style={styles.macroChip}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}g</Text>
    </View>
  );
}

// ─── MealCard ─────────────────────────────────────────────────────────────────

type MealCardProps = {
  meal: Meal;
  onPress?: () => void;
};

export function MealCard({ meal, onPress }: MealCardProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      pressed.value > 0.5 ? Colors.surfaceContainerLowest : Colors.surfaceContainerLow,
    transform: [{ scale: 1 - pressed.value * 0.02 }],
  }));

  const typeColor = MEAL_TYPE_COLOR[meal.type];
  const caloriesLeft = meal.kcal;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withSpring(1, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 20, stiffness: 400 });
        }}
        style={styles.pressable}
        android_ripple={null}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: typeColor }]} />

        <View style={styles.content}>
          {/* Top row: name + type badge + kcal */}
          <View style={styles.topRow}>
            <View style={styles.titleBlock}>
              <Text style={[styles.mealType, { color: typeColor }]}>
                {meal.type}
              </Text>
              <Text style={styles.mealName} numberOfLines={1}>
                {meal.name}
              </Text>
            </View>
            <Text style={styles.kcal}>{caloriesLeft} kcal</Text>
          </View>

          {/* Time + macro chips row */}
          <View style={styles.bottomRow}>
            <Text style={styles.time}>{meal.time}</Text>
            <View style={styles.macroRow}>
              <MacroChip label="P" value={meal.macros.protein} />
              <MacroChip label="C" value={meal.macros.carbs} />
              <MacroChip label="F" value={meal.macros.fats} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  accentBar: {
    width: 4,
    borderRadius: Radius.full,
    marginVertical: Spacing.three,
    marginLeft: Spacing.three,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  mealType: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    letterSpacing: 0.8,
  },
  mealName: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleSm,
  },
  kcal: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.bodyMd,
    paddingTop: Spacing.three,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroChip: {
    alignItems: 'center',
    gap: 1,
  },
  macroLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.onSurface,
  },
});
