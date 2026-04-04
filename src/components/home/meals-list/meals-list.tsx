import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Meal } from '@/types/nutrition';
import { MealCard } from '../meal-card';
import { styles } from './meals-list.styles';

type MealsListProps = {
  meals: Meal[];
  onViewDiary?: () => void;
  onMealPress?: (meal: Meal) => void;
};

export function MealsList({ meals, onViewDiary, onMealPress }: MealsListProps) {
  return (
    <View style={styles.section}>
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

      <View style={styles.list}>
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onPress={() => onMealPress?.(meal)} />
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
