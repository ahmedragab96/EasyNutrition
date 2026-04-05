/**
 * Calendar Screen — "The Living Ledger"
 *
 * Layout:
 *  ┌─ MonthHeader ─────────────────────────────┐
 *  │  THE LIVING LEDGER                        │
 *  │  March 2026  (bold)                       │
 *  │  <   This Month   >                       │
 *  ├─ Calendar Grid ───────────────────────────┤
 *  │  SUN  MON  TUE  WED  THU  FRI  SAT        │
 *  │  [ring][ring]…                            │
 *  ├─ Day Detail ──────────────────────────────┤
 *  │  Tuesday, March 31          🍴            │
 *  │  You've reached 88% of your daily target. │
 *  │  <MealCard> × n                           │
 *  └───────────────────────────────────────────┘
 *
 * Uses flash-calendar's `useCalendar` hook for week generation
 * and `toDateId` / `fromDateId` for date ↔ ID conversion.
 */

import { Ionicons } from '@expo/vector-icons';
import {
  fromDateId,
  toDateId,
  useCalendar,
} from '@marceloterreiro/flash-calendar';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayRing } from '@/components/calendar/day-ring';
import { MealCard } from '@/components/home/meal-card';
import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useDayLog } from '@/hooks/use-day-log';
import { useMonthLogs } from '@/hooks/use-month-logs';
import { DailySummary, Meal } from '@/types/nutrition';

const DEFAULT_CALORIE_GOAL = 2000;

// ─── Month helpers ────────────────────────────────────────────────────────────

function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type MonthHeaderProps = {
  label: string;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onThisMonth: () => void;
};

function MonthHeader({
  label,
  isCurrentMonth,
  onPrev,
  onNext,
  onThisMonth,
}: MonthHeaderProps) {
  return (
    <View style={hStyles.root}>
      <Text style={hStyles.eyebrow}>THE LIVING LEDGER</Text>
      <Text style={hStyles.title}>{label}</Text>
      <View style={hStyles.navRow}>
        <Pressable
          onPress={onPrev}
          style={hStyles.arrowBtn}
          accessibilityLabel="Previous month"
          android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.onSurface} />
        </Pressable>

        <Pressable
          onPress={onThisMonth}
          style={[hStyles.chip, isCurrentMonth && hStyles.chipActive]}
          android_ripple={{ color: Colors.primaryContainer }}
        >
          <Text style={[hStyles.chipLabel, isCurrentMonth && hStyles.chipLabelActive]}>
            This Month
          </Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          style={hStyles.arrowBtn}
          accessibilityLabel="Next month"
          android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const hStyles = StyleSheet.create({
  root: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  eyebrow: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.4,
  },
  title: {
    fontSize: FontSize.headlineMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineMd,
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primaryContainer },
  chipLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  chipLabelActive: { color: Colors.onPrimaryContainer },
});

// ─── Day Detail Panel ─────────────────────────────────────────────────────────

type DayDetailProps = {
  dateId: string;
  meals: Meal[];
  summary: DailySummary;
  loading: boolean;
};

function DayDetail({ dateId, meals, summary, loading }: DayDetailProps) {
  const date = fromDateId(dateId);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const heading = `${weekday}, ${monthDay}`;
  const hasData = summary.caloriesConsumed > 0;
  const percent = hasData
    ? Math.round((summary.caloriesConsumed / summary.caloriesGoal) * 100)
    : 0;

  return (
    <View style={dStyles.root}>
      {/* Header row */}
      <View style={dStyles.headerRow}>
        <View style={dStyles.headerText}>
          <Text style={dStyles.heading}>{heading}</Text>
          {hasData && (
            <Text style={dStyles.targetLine}>
              You've reached{' '}
              <Text style={dStyles.targetPct}>{percent}%</Text>
              {' '}of your daily target.
            </Text>
          )}
        </View>
        <View style={dStyles.iconBadge}>
          <Ionicons name="restaurant-outline" size={18} color={Colors.onSurfaceVariant} />
        </View>
      </View>

      {/* Meals */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : meals.length > 0 ? (
        <View style={dStyles.mealList}>
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      ) : (
        <View style={dStyles.emptyState}>
          <Text style={dStyles.emptyIcon}>🥗</Text>
          <Text style={dStyles.emptyText}>No meals logged for this day.</Text>
        </View>
      )}
    </View>
  );
}

const dStyles = StyleSheet.create({
  root: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.five,
    gap: Spacing.four,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  heading: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleLg,
  },
  targetLine: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
  targetPct: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealList: { gap: Spacing.three },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
});

// ─── CalendarScreen ───────────────────────────────────────────────────────────

const TODAY = new Date();
const TODAY_ID = toDateId(TODAY);
const CURRENT_MONTH = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

export default function CalendarScreen() {
  const { width } = useWindowDimensions();
  const [currentMonth, setCurrentMonth] = useState<Date>(CURRENT_MONTH);
  const [selectedDateId, setSelectedDateId] = useState<string>(TODAY_ID);

  // Cell dimensions
  const cellSize = Math.floor((width - Spacing.five * 2) / 7);
  const ringSize = cellSize - 6;

  // flash-calendar week generation
  const { weeksList, weekDaysList, calendarRowMonth } = useCalendar({
    calendarMonthId: toDateId(currentMonth),
    calendarFirstDayOfWeek: 'sunday',
  });

  // Real data
  const { calorieSums, refresh: refreshMonth } = useMonthLogs(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,  // 1-indexed
  );
  const { meals, summary, loading: dayLoading, refresh: refreshDay } = useDayLog(selectedDateId);

  useFocusEffect(useCallback(() => {
    refreshMonth();
    refreshDay();
  }, [refreshMonth, refreshDay]));

  const isCurrentMonth = useMemo(
    () =>
      currentMonth.getFullYear() === CURRENT_MONTH.getFullYear() &&
      currentMonth.getMonth() === CURRENT_MONTH.getMonth(),
    [currentMonth],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Month Header ── */}
        <MonthHeader
          label={calendarRowMonth}
          isCurrentMonth={isCurrentMonth}
          onPrev={() => setCurrentMonth((m) => addMonths(m, -1))}
          onNext={() => setCurrentMonth((m) => addMonths(m, 1))}
          onThisMonth={() => {
            setCurrentMonth(CURRENT_MONTH);
            setSelectedDateId(TODAY_ID);
          }}
        />

        {/* ── Calendar Grid ── */}
        <View style={styles.grid}>
          {/* Day name headers */}
          <View style={styles.dayHeaderRow}>
            {weekDaysList.map((name) => (
              <Text
                key={name + Math.random()}
                style={[styles.dayHeader, { width: cellSize }]}
              >
                {name.slice(0, 3).toUpperCase()}
              </Text>
            ))}
          </View>

          {/* Weeks */}
          {weeksList.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day) => {
                const kcal = calorieSums[day.id] ?? 0;
                const progress = kcal / DEFAULT_CALORIE_GOAL;

                return (
                  <Pressable
                    key={day.id}
                    onPress={() => setSelectedDateId(day.id)}
                    style={{ width: cellSize, alignItems: 'center', paddingVertical: 3 }}
                    accessibilityRole="button"
                    accessibilityLabel={day.displayLabel}
                  >
                    <DayRing
                      displayLabel={day.displayLabel}
                      progress={progress}
                      hasData={kcal > 0}
                      isToday={day.isToday}
                      isSelected={day.id === selectedDateId}
                      isDifferentMonth={day.isDifferentMonth}
                      size={ringSize}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Selected Day Detail ── */}
        <DayDetail
          dateId={selectedDateId}
          meals={meals}
          summary={summary}
          loading={dayLoading}
        />

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
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  grid: { gap: 0 },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
  },
  dayHeader: {
    textAlign: 'center',
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  weekRow: { flexDirection: 'row' },
  bottomSpacer: { height: Spacing.eight },
});
