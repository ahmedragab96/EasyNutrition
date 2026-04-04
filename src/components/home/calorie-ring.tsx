/**
 * CalorieRing — animated SVG progress ring.
 *
 * Color transitions based on consumed / goal ratio:
 *   0% → 65%  : primary green   (#006f1d) — healthy
 *   65% → 85% : amber           (#c47800) — approaching limit
 *   85% → 100%: tertiary        (#ad350a) — at/over limit
 *
 * Design rules (DESIGN.md):
 *  - Track: surface-container-highest
 *  - Progress fill: animates through primary → amber → tertiary
 *  - Display-LG (56px) Plus Jakarta Sans for the hero calorie number
 *  - Ambient shadow at 4% for the card
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { DailySummary } from '@/types/nutrition';

// ─── Ring geometry ────────────────────────────────────────────────────────────

const SIZE = 220;
const CENTER = SIZE / 2;
const STROKE_WIDTH = 18;
const RADIUS = CENTER - STROKE_WIDTH / 2 - 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CalorieRing ──────────────────────────────────────────────────────────────

type CalorieRingProps = {
  summary: DailySummary;
};

export function CalorieRing({ summary }: CalorieRingProps) {
  const { caloriesConsumed, caloriesGoal, caloriesBurned } = summary;
  const caloriesLeft = Math.max(caloriesGoal - caloriesConsumed + caloriesBurned, 0);
  const targetProgress = Math.min(caloriesConsumed / caloriesGoal, 1);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(targetProgress, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetProgress]);

  // Animated SVG props — stroke color + dash offset
  const animatedProps = useAnimatedProps(() => {
    const stroke = interpolateColor(
      progress.value,
      [0, 0.65, 0.85, 1],
      [Colors.primary, Colors.primary, '#c47800', Colors.tertiary],
    );
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
      stroke,
    };
  });

  return (
    <View style={styles.card}>
      {/* ── Ring ── */}
      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={Colors.surfaceContainerHighest}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress arc — rotated to start from top */}
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            // rotate so arc starts from 12 o'clock
            rotation="-90"
            origin={`${CENTER}, ${CENTER}`}
          />
        </Svg>

        {/* ── Center overlay text ── */}
        <View style={styles.centerOverlay} pointerEvents="none">
          <Text style={styles.centerLabel}>CALORIES LEFT</Text>
          <Text style={styles.centerNumber}>
            {caloriesLeft.toLocaleString()}
          </Text>
          <Text style={styles.centerSub}>
            of {caloriesGoal.toLocaleString()} kcal
          </Text>
        </View>
      </View>

      {/* ── Eaten / Burned stats row ── */}
      <View style={styles.statsRow}>
        <StatItem label="EATEN" value={caloriesConsumed} />
        <View style={styles.statDivider} />
        <StatItem label="BURNED" value={caloriesBurned} />
      </View>
    </View>
  );
}

// ─── Stat item ────────────────────────────────────────────────────────────────

type StatItemProps = { label: string; value: number };

function StatItem({ label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    alignItems: 'center',
    gap: Spacing.four,
    // Ambient float shadow
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },

  // ── Ring ───────────────────────────────────────────────────────────────────
  ringWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  centerLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  centerNumber: {
    fontSize: FontSize.displayLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.displayLg,
    includeFontPadding: false,
  },
  centerSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.eight,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleMd,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.4,
  },
});
