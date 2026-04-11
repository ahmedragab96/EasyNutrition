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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Sub-component ────────────────────────────────────────────────────────────

type StatItemProps = { label: string; value: number; scale: number };

function StatItem({ label, value, scale }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statLabel, { fontSize: 11 * scale }]}>{label}</Text>
      <Text style={[styles.statValue, { fontSize: 18 * scale }]}>{value.toLocaleString()}</Text>
    </View>
  );
}

// ─── CalorieRing ──────────────────────────────────────────────────────────────

type CalorieRingProps = {
  summary: DailySummary;
  size?: number;
};

export function CalorieRing({ summary, size = 220 }: CalorieRingProps) {
  const scale = size / 220;
  const strokeWidth = Math.round(18 * scale);
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4 * scale;
  const circumference = 2 * Math.PI * radius;

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
      strokeDashoffset: circumference * (1 - progress.value),
      stroke,
    };
  });

  return (
    <View style={styles.card}>
      <View style={[styles.ringWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.surfaceContainerHighest}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        <View style={styles.centerOverlay} pointerEvents="none">
          <Text style={[styles.centerLabel, { fontSize: 11 * scale }]}>CALORIES LEFT</Text>
          <Text style={[styles.centerNumber, { fontSize: 56 * scale, lineHeight: 64 * scale }]}>
            {caloriesLeft}
          </Text>
          <Text style={[styles.centerSub, { fontSize: 14 * scale }]}>
            of {caloriesGoal} kcal
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatItem label="EATEN" value={caloriesConsumed} scale={scale} />
        <View style={styles.statDivider} />
        <StatItem label="BURNED" value={caloriesBurned} scale={scale} />
      </View>
    </View>
  );
}
