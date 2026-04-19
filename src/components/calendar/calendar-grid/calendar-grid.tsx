import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { DayRing } from '@/components/calendar/day-ring';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

const DEFAULT_CALORIE_GOAL = 2000;

type CalendarDay = {
  id: string;
  displayLabel: string;
  isToday: boolean;
  isDifferentMonth: boolean;
};

export type CalendarGridProps = {
  weekDaysList: string[];
  weeksList: CalendarDay[][];
  calorieSums: Record<string, number>;
  selectedDateId: string;
  onSelectDate: (dateId: string) => void;
};

export function CalendarGrid({
  weekDaysList,
  weeksList,
  calorieSums,
  selectedDateId,
  onSelectDate,
}: CalendarGridProps) {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor((width - Spacing.five * 2) / 7);
  const ringSize = cellSize - 6;

  return (
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
                onPress={() => onSelectDate(day.id)}
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
  );
}

const styles = StyleSheet.create({
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
});
