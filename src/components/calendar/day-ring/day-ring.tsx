import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { styles } from './day-ring.styles';

function progressColor(p: number): string {
  if (p >= 0.85) return Colors.primary;   // green  — at/near goal
  if (p >= 0.50) return '#c47800';        // amber  — getting closer
  return Colors.tertiary;                 // red    — far from goal
}

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

export function DayRing({
  displayLabel,
  progress,
  hasData,
  isToday,
  isSelected,
  isDifferentMonth,
  size,
}: DayRingProps) {
  const sw = Math.max(size * 0.09, 3);
  const center = size / 2;
  const radius = center - sw / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));
  const color = progressColor(progress);
  const fontSize = size * 0.28;
  const opacity = isDifferentMonth ? 0.28 : 1;

  return (
    <View style={[styles.cell, { width: size, height: size, opacity }]}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {isToday && (
          <Circle cx={center} cy={center} r={center - 1} fill={Colors.primary} />
        )}

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
          { fontSize, color: isToday ? Colors.onPrimary : Colors.onSurface },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}
