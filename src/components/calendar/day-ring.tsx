/**
 * DayRing — mini SVG calorie-progress ring for calendar cells.
 *
 * States:
 *  - No data (future / unlogged): track circle only
 *  - 0–65 % consumed: primary green arc
 *  - 65–85 %: amber arc
 *  - >85 %: tertiary red arc
 *  - isToday: filled primary circle (solid, white number)
 *  - isSelected (non-today): thin primaryContainer border around the ring
 *  - isDifferentMonth: 28 % opacity
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors, FontFamily } from '@/constants/theme';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function progressColor(p: number): string {
  if (p <= 0.65) return Colors.primary;
  if (p <= 0.85) return '#c47800';
  return Colors.tertiary;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type DayRingProps = {
  displayLabel: string;
  /** 0–1+. 0 means no data logged. */
  progress: number;
  hasData: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDifferentMonth: boolean;
  /** Outer diameter in px */
  size: number;
};

// ─── DayRing ─────────────────────────────────────────────────────────────────

export function DayRing({
  displayLabel,
  progress,
  hasData,
  isToday,
  isSelected,
  isDifferentMonth,
  size,
}: DayRingProps) {
  const sw = Math.max(size * 0.09, 3);       // stroke width
  const center = size / 2;
  const radius = center - sw / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));
  const color = progressColor(progress);
  const fontSize = size * 0.28;
  const opacity = isDifferentMonth ? 0.28 : 1;

  return (
    <View style={[styles.cell, { width: size, height: size, opacity }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Today: filled disc */}
        {isToday && (
          <Circle
            cx={center}
            cy={center}
            r={center - 1}
            fill={Colors.primary}
          />
        )}

        {/* Track ring */}
        {!isToday && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.surfaceContainerHighest}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Progress arc */}
        {hasData && progress > 0 && !isToday && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        )}

        {/* Selected highlight (non-today) */}
        {isSelected && !isToday && (
          <Circle
            cx={center}
            cy={center}
            r={center - 1.5}
            stroke={Colors.primary}
            strokeWidth={1.5}
            fill="none"
            strokeOpacity={0.5}
          />
        )}
      </Svg>

      <Text
        style={[
          styles.label,
          {
            fontSize,
            color: isToday ? Colors.onPrimary : Colors.onSurface,
          },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.displaySemiBold,
    includeFontPadding: false,
  },
});
