import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';
import { InsightsResult } from '@/types/nutrition';
import { InsightCard } from '../insight-card';
import { ScoreRing } from '../score-ring';
import { styles } from './insights-content.styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastAnalysed(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── InsightsContent ──────────────────────────────────────────────────────────

type InsightsContentProps = {
  result: InsightsResult;
  lastAnalysedAt: string | null;
  loading: boolean;
  onReanalyse: () => void;
};

export function InsightsContent({
  result,
  lastAnalysedAt,
  loading,
  onReanalyse,
}: InsightsContentProps) {
  return (
    <>
      {/* ── Hero: score + headline ── */}
      <View style={styles.heroCard}>
        <ScoreRing score={result.score} />
        <View style={styles.heroText}>
          <Text style={styles.heroLabel}>MONTHLY ANALYSIS</Text>
          <Text style={styles.heroHeadline}>{result.headline}</Text>
        </View>
      </View>

      {/* ── Streaks ── */}
      <View style={styles.streakRow}>
        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>{result.currentStreak}</Text>
          <Text style={styles.streakLabel}>CURRENT STREAK</Text>
          <Text style={styles.streakUnit}>days on goal</Text>
        </View>
        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>{result.bestStreak}</Text>
          <Text style={styles.streakLabel}>BEST STREAK</Text>
          <Text style={styles.streakUnit}>days this month</Text>
        </View>
        {result.bestWeekday ? (
          <View style={styles.streakCard}>
            <Text style={[styles.streakValue, { fontSize: FontSize.titleSm }]}>
              {result.bestWeekday.slice(0, 3).toUpperCase()}
            </Text>
            <Text style={styles.streakLabel}>BEST DAY</Text>
            <Text style={styles.streakUnit}>most consistent</Text>
          </View>
        ) : null}
      </View>

      {/* ── Insight sections ── */}
      {result.sections.map((section) => (
        <InsightCard key={section.id} section={section} />
      ))}

      {/* ── Recommendations ── */}
      {result.recommendations.length > 0 && (
        <View style={styles.recoCard}>
          <View style={styles.recoHeader}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Text style={styles.recoTitle}>Recommendations</Text>
          </View>
          {result.recommendations.map((rec, i) => (
            <View key={i} style={styles.recoItem}>
              <View style={styles.recoDot} />
              <Text style={styles.recoText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Re-analyse footer ── */}
      <View style={styles.reanalyseRow}>
        {lastAnalysedAt && (
          <Text style={styles.lastAnalysed}>
            Last analysed {formatLastAnalysed(lastAnalysedAt)}
          </Text>
        )}
        <Pressable
          style={[styles.reanalyseBtn, loading && styles.reanalyseBtnBusy]}
          onPress={onReanalyse}
          disabled={loading}
          android_ripple={{ color: Colors.surfaceContainerHighest, borderless: false }}
        >
          {loading
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Ionicons name="refresh" size={15} color={Colors.primary} />
          }
          <Text style={styles.reanalyseBtnLabel}>
            {loading ? 'Analysing…' : 'Re-analyse'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
