import React from 'react';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { InsightRating, InsightSection } from '@/types/nutrition';
import { styles } from './insight-card.styles';

// ─── Rating maps ──────────────────────────────────────────────────────────────

export const RATING_COLORS: Record<InsightRating, string> = {
  good: Colors.primary,
  fair: '#c47800',
  poor: Colors.tertiary,
};

export const RATING_BG: Record<InsightRating, string> = {
  good: Colors.primaryContainer,
  fair: '#fff3cd',
  poor: Colors.tertiaryContainer,
};

export const RATING_LABEL: Record<InsightRating, string> = {
  good: 'On Track',
  fair: 'Getting There',
  poor: 'Needs Work',
};

// ─── InsightCard ──────────────────────────────────────────────────────────────

type InsightCardProps = { section: InsightSection };

export function InsightCard({ section }: InsightCardProps) {
  const color = RATING_COLORS[section.rating];
  const bg = RATING_BG[section.rating];
  const label = RATING_LABEL[section.rating];

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{section.title}</Text>
          <View style={[styles.chip, { backgroundColor: bg }]}>
            <Text style={[styles.chipText, { color }]}>{label}</Text>
          </View>
        </View>
        <Text style={styles.insight}>{section.insight}</Text>
      </View>
    </View>
  );
}
