/**
 * MacroSection — three animated progress bars for Protein, Carbs, Fats.
 *
 * Each bar:
 *  - Protein: primary green (#006f1d)
 *  - Carbs:   secondary blue (#00649b)
 *  - Fats:    tertiary orange-red (#ad350a)
 *
 * Design rules (DESIGN.md):
 *  - Track: surface-container-highest
 *  - rounded-full on the outer container only
 *  - No dividers between bars — use spacing-6 vertical gap
 *  - Label-SM for unit measure (onSurfaceVariant)
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { DailySummary } from '@/types/nutrition';

// ─── Single macro bar ─────────────────────────────────────────────────────────

type MacroBarProps = {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  /** ms delay before animation starts */
  delay?: number;
};

function MacroBar({ label, consumed, goal, color, delay = 0 }: MacroBarProps) {
  const progress = Math.min(consumed / goal, 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(progress, {
        duration: 900,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [progress]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.barRow}>
      {/* Label + values */}
      <View style={styles.barHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValues}>
          <Text style={[styles.macroConsumed, { color }]}>{consumed}g</Text>
          <Text style={styles.macroGoal}> / {goal}g</Text>
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, animatedFill, { backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

// ─── MacroSection ─────────────────────────────────────────────────────────────

type MacroSectionProps = {
  summary: DailySummary;
};

export function MacroSection({ summary }: MacroSectionProps) {
  const { macros } = summary;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Daily Macros</Text>

      <MacroBar
        label="Protein"
        consumed={macros.protein.consumed}
        goal={macros.protein.goal}
        color={Colors.primary}
        delay={0}
      />
      <MacroBar
        label="Carbs"
        consumed={macros.carbs.consumed}
        goal={macros.carbs.goal}
        color={Colors.secondary}
        delay={120}
      />
      <MacroBar
        label="Fats"
        consumed={macros.fats.consumed}
        goal={macros.fats.goal}
        color={Colors.tertiary}
        delay={240}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.six,
    gap: Spacing.five,
    // Subtle card elevation
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleSm,
  },

  // ── Per bar ────────────────────────────────────────────────────────────────
  barRow: {
    gap: Spacing.two,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  macroLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  macroValues: {
    fontSize: FontSize.bodyMd,
    lineHeight: LineHeight.bodyMd,
  },
  macroConsumed: {
    fontFamily: FontFamily.bodySemiBold,
  },
  macroGoal: {
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
