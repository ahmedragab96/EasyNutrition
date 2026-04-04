/**
 * Home Screen
 *
 * Assembles:
 *  - App header (brand + date)
 *  - CalorieRing (SVG progress wheel, color-coded by consumption %)
 *  - MacroSection (Protein / Carbs / Fats animated bars)
 *  - MealsList (recent meals)
 */

import { toDateId } from '@marceloterreiro/flash-calendar';
import React from 'react';
import {
  ActivityIndicator,
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
import { useDayLog } from '@/hooks/use-day-log';

const TODAY_ID = toDateId(new Date());

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
  const { meals, summary, loading } = useDayLog(TODAY_ID);

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* ── Calorie Progress Ring ── */}
            <CalorieRing summary={summary} />

            {/* ── Macro Nutrition Bars ── */}
            <MacroSection summary={summary} />

            {/* ── Recent Meals ── */}
            <MealsList
              meals={meals}
              onViewDiary={() => {}}
              onMealPress={() => {}}
            />
          </>
        )}

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  bottomSpacer: {
    height: Spacing.eight,
  },
});
