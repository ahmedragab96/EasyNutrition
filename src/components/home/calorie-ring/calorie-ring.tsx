import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { DailySummary } from '@/types/nutrition';
import { styles } from './calorie-ring.styles';

// ─── Ring geometry ────────────────────────────────────────────────────────────

const SIZE = 220;
const CENTER = SIZE / 2;
const STROKE_WIDTH = 18;
const RADIUS = CENTER - STROKE_WIDTH / 2 - 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Sub-component ────────────────────────────────────────────────────────────

type StatItemProps = { label: string; value: number };

function StatItem({ label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    </View>
  );
}

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
      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={Colors.surfaceContainerHighest}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
          />
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${CENTER}, ${CENTER}`}
          />
        </Svg>

        <View style={styles.centerOverlay} pointerEvents="none">
          <Text style={styles.centerLabel}>CALORIES LEFT</Text>
          <Text style={styles.centerNumber}>{caloriesLeft.toLocaleString()}</Text>
          <Text style={styles.centerSub}>of {caloriesGoal.toLocaleString()} kcal</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatItem label="EATEN" value={caloriesConsumed} />
        <View style={styles.statDivider} />
        <StatItem label="BURNED" value={caloriesBurned} />
      </View>
    </View>
  );
}
