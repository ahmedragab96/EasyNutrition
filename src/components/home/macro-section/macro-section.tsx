import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { DailySummary } from '@/types/nutrition';
import { styles } from './macro-section.styles';

type MacroBarProps = {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  delay?: number;
};

function MacroBar({ label, consumed, goal, color, delay = 0 }: MacroBarProps) {
  const progress = Math.min(consumed / goal, 1);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(progress, { duration: 900, easing: Easing.out(Easing.quad) }),
    );
  }, [progress]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValues}>
          <Text style={[styles.macroConsumed, { color }]}>{+parseFloat((consumed).toFixed(1))}g</Text>
          <Text style={styles.macroGoal}> / {goal}g</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedFill, { backgroundColor: color }]} />
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
