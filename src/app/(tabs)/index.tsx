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
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
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
import { WaterTube } from '@/components/home/water-tube';
import { Navbar } from '@/components/ui/navbar';
import { Colors, Spacing } from '@/constants/theme';
import { useDayLog } from '@/hooks/use-day-log';
import { useWaterLog } from '@/hooks/use-water-log';

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
  const { meals, summary, loading, refresh } = useDayLog(TODAY_ID);
  const { waterMl, update: updateWater } = useWaterLog(TODAY_ID);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

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
            {/* ── Calorie Ring + Water Tube ── */}
            <View style={styles.heroRow}>
              <View style={styles.ringWrapper}>
                <CalorieRing summary={summary} size={170} />
              </View>
              <WaterTube waterMl={waterMl} onWaterChange={updateWater} />
            </View>

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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  ringWrapper: {
    flex: 1,
  },
  bottomSpacer: {
    height: Spacing.eight,
  },
});
