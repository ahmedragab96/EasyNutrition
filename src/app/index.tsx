/**
 * Home Screen
 *
 * Assembles:
 *  - App header (brand + date)
 *  - CalorieRing (SVG progress wheel, color-coded by consumption %)
 *  - MacroSection (Protein / Carbs / Fats animated bars)
 *  - MealsList (recent meals, no images)
 */

import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalorieRing } from '@/components/home/calorie-ring';
import { MacroSection } from '@/components/home/macro-section';
import { MealsList } from '@/components/home/meals-list';
import { Navbar } from '@/components/ui/navbar';
import { Colors, Spacing } from '@/constants/theme';
import { DailySummary, Meal } from '@/types/nutrition';

// ─── Mock data (replace with real data layer later) ───────────────────────────

const DAILY_SUMMARY: DailySummary = {
  caloriesConsumed: 1458,
  caloriesGoal: 2200,
  caloriesBurned: 320,
  macros: {
    protein: { consumed: 92, goal: 140 },
    carbs: { consumed: 185, goal: 250 },
    fats: { consumed: 42, goal: 70 },
  },
};

const RECENT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Poached Egg & Avocado',
    time: '8:30 AM',
    type: 'BREAKFAST',
    kcal: 420,
    macros: { protein: 18, carbs: 24, fats: 28 },
  },
  {
    id: '2',
    name: 'Mediterranean Bowl',
    time: '1:15 PM',
    type: 'LUNCH',
    kcal: 650,
    macros: { protein: 32, carbs: 58, fats: 22 },
  },
  {
    id: '3',
    name: 'Raw Almonds',
    time: '4:00 PM',
    type: 'SNACK',
    kcal: 160,
    macros: { protein: 6, carbs: 4, fats: 14 },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── App Header ── */}
        <Navbar
          greeting={`${getGreeting()} 👋`}
          date={formatDate()}
        />

        {/* ── Calorie Progress Ring ── */}
        <CalorieRing summary={DAILY_SUMMARY} />

        {/* ── Macro Nutrition Bars ── */}
        <MacroSection summary={DAILY_SUMMARY} />

        {/* ── Recent Meals ── */}
        <MealsList
          meals={RECENT_MEALS}
          onViewDiary={() => console.log('View diary')}
          onMealPress={(meal) => console.log('Meal pressed:', meal.name)}
        />

        {/* Bottom breathing room above tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },

  bottomSpacer: {
    height: Spacing.eight,
  },
});
