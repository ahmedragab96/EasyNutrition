import { toDateId, useCalendar } from '@marceloterreiro/flash-calendar';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { DayDetail } from '@/components/calendar/day-detail';
import { MonthHeader } from '@/components/calendar/month-header';
import { Colors, Spacing } from '@/constants/theme';
import { useDayLog } from '@/hooks/use-day-log';
import { useMonthLogs } from '@/hooks/use-month-logs';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const TODAY = new Date();
const TODAY_ID = toDateId(TODAY);
const CURRENT_MONTH = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState<Date>(CURRENT_MONTH);
  const [selectedDateId, setSelectedDateId] = useState<string>(TODAY_ID);

  const { weeksList, weekDaysList, calendarRowMonth } = useCalendar({
    calendarMonthId: toDateId(currentMonth),
    calendarFirstDayOfWeek: 'sunday',
  });

  const { calorieSums, refresh: refreshMonth } = useMonthLogs(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
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

        <CalendarGrid
          weekDaysList={weekDaysList}
          weeksList={weeksList}
          calorieSums={calorieSums}
          selectedDateId={selectedDateId}
          onSelectDate={setSelectedDateId}
        />

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
  bottomSpacer: { height: Spacing.eight },
});
