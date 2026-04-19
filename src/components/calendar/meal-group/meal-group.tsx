import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { MealCard } from '@/components/home/meal-card';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Meal } from '@/types/nutrition';

const MEAL_TYPE_META: Record<Meal['type'], { label: string; icon: string }> = {
  BREAKFAST: { label: 'Breakfast', icon: '🌅' },
  LUNCH:     { label: 'Lunch',     icon: '🌞' },
  DINNER:    { label: 'Dinner',    icon: '🌙' },
  SNACK:     { label: 'Snack',     icon: '🍎' },
};

export type MealGroupProps = { type: Meal['type']; meals: Meal[] };

export function MealGroup({ type, meals }: MealGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  function toggle() {
    LayoutAnimation.configureNext({
      duration: 220,
      update: { type: 'easeInEaseOut' },
      create: { type: 'easeInEaseOut', property: 'opacity' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    rotation.value = withTiming(expanded ? 0 : 180, { duration: 220 });
    setExpanded((v) => !v);
  }

  const { label, icon } = MEAL_TYPE_META[type];
  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.header}
        onPress={toggle}
        android_ripple={{ color: Colors.surfaceContainerHigh }}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.kcal}>{totalKcal} kcal</Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={16} color={Colors.onSurfaceVariant} />
          </Animated.View>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.content}>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: { fontSize: 16 },
  label: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  kcal: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
});
