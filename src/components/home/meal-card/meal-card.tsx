import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { Meal, MealType } from '@/types/nutrition';
import { styles } from './meal-card.styles';

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
        <View style={[styles.accentBar, { backgroundColor: typeColor }]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.titleBlock}>
              <Text style={[styles.mealType, { color: typeColor }]}>{meal.type}</Text>
              <Text style={styles.mealName} numberOfLines={1}>
                {meal.name}
              </Text>
            </View>
            <Text style={styles.kcal}>{meal.kcal} kcal</Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.time}>{meal.time}</Text>
            <View style={styles.macroRow}>
              <MacroChip label="P" value={meal.macros.protein} />
              <MacroChip label="C" value={meal.macros.carbs} />
              <MacroChip label="F" value={meal.macros.fats} />
            </View>
          </View>

          {meal.description ? (
            <View style={styles.descriptionRow}>
              <Text style={styles.descriptionLabel}>INGREDIENTS</Text>
              <Text style={styles.descriptionText}>{meal.description}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
