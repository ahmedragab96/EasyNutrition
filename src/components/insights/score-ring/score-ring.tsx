import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { styles } from './score-ring.styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 75) return Colors.primary;
  if (score >= 50) return '#c47800';
  return Colors.tertiary;
}

// ─── ScoreRing ────────────────────────────────────────────────────────────────

type ScoreRingProps = { score: number };

export function ScoreRing({ score }: ScoreRingProps) {
  const size = 120;
  const sw = 10;
  const center = size / 2;
  const radius = center - sw / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(score / 100, 1));
  const color = scoreColor(score);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center} cy={center} r={radius}
          stroke={Colors.surfaceContainerHighest}
          strokeWidth={sw}
          fill="none"
        />
        <Circle
          cx={center} cy={center} r={radius}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
      <Text style={styles.scoreLabel}>SCORE</Text>
    </View>
  );
}
