/**
 * Insights Screen — "The Living Ledger"
 *
 * AI-powered monthly nutrition analysis:
 *  ┌─ MonthHeader ──────────────────────────────┐
 *  │  MONTHLY INSIGHTS                          │
 *  │  April 2026  (bold)                        │
 *  │  <   This Month   >                        │
 *  ├─ Score Hero ───────────────────────────────┤
 *  │  [Score Ring]  Headline text               │
 *  ├─ Insight Sections ─────────────────────────┤
 *  │  Calorie Consistency  [Good]               │
 *  │  Macro Balance        [Fair]               │
 *  │  Meal Patterns        [Poor]               │
 *  │  Food Variety         [Fair]               │
 *  ├─ Recommendations ──────────────────────────┤
 *  │  • Add more protein at breakfast           │
 *  │  • …                                       │
 *  ├─ Streaks ──────────────────────────────────┤
 *  │  Current streak   Best streak              │
 *  └─ CTA ──────────────────────────────────────┘
 *     "Last analysed X days ago" · Re-analyse
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useInsights } from '@/hooks/use-insights';
import { InsightRating, InsightSection, InsightsResult } from '@/types/nutrition';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function addMonths(year: number, month: number, n: number): { year: number; month: number } {
  const d = new Date(year, month - 1 + n, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

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

const RATING_COLORS: Record<InsightRating, string> = {
  good: Colors.primary,
  fair: '#c47800',
  poor: Colors.tertiary,
};

const RATING_BG: Record<InsightRating, string> = {
  good: Colors.primaryContainer,
  fair: '#fff3cd',
  poor: Colors.tertiaryContainer,
};

const RATING_LABEL: Record<InsightRating, string> = {
  good: 'On Track',
  fair: 'Getting There',
  poor: 'Needs Work',
};

function scoreColor(score: number): string {
  if (score >= 75) return Colors.primary;
  if (score >= 50) return '#c47800';
  return Colors.tertiary;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
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
      <Text style={[srStyles.scoreNumber, { color }]}>{score}</Text>
      <Text style={srStyles.scoreLabel}>SCORE</Text>
    </View>
  );
}

const srStyles = StyleSheet.create({
  scoreNumber: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayExtraBold,
    lineHeight: FontSize.headlineSm,
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    marginTop: 2,
  },
});

// ─── InsightCard ─────────────────────────────────────────────────────────────

function InsightCard({ section }: { section: InsightSection }) {
  const color = RATING_COLORS[section.rating];
  const bg = RATING_BG[section.rating];
  const label = RATING_LABEL[section.rating];

  return (
    <View style={icStyles.card}>
      <View style={[icStyles.accent, { backgroundColor: color }]} />
      <View style={icStyles.body}>
        <View style={icStyles.headerRow}>
          <Text style={icStyles.title}>{section.title}</Text>
          <View style={[icStyles.chip, { backgroundColor: bg }]}>
            <Text style={[icStyles.chipText, { color }]}>{label}</Text>
          </View>
        </View>
        <Text style={icStyles.insight}>{section.insight}</Text>
      </View>
    </View>
  );
}

const icStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    borderRadius: Radius.full,
    margin: Spacing.three,
    marginRight: 0,
  },
  body: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    flex: 1,
  },
  chip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    letterSpacing: 0.4,
  },
  insight: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
});

// ─── InsightsContent ──────────────────────────────────────────────────────────

function InsightsContent({
  result,
  lastAnalysedAt,
  loading,
  onReanalyse,
}: {
  result: InsightsResult;
  lastAnalysedAt: string | null;
  loading: boolean;
  onReanalyse: () => void;
}) {
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

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({
  monthLabel,
  loading,
  error,
  onAnalyse,
}: {
  monthLabel: string;
  loading: boolean;
  error: string | null;
  onAnalyse: () => void;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="analytics-outline" size={40} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No insights yet</Text>
      <Text style={styles.emptyBody}>
        Analyse your {monthLabel} nutrition data to get personalised feedback and recommendations.
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Pressable
        style={[styles.ctaBtn, loading && styles.ctaBtnBusy]}
        onPress={onAnalyse}
        disabled={loading}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {loading
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="sparkles" size={18} color={Colors.onPrimary} />
        }
        <Text style={styles.ctaLabel}>
          {loading ? 'Analysing…' : `Analyse ${monthLabel}`}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── InsightsScreen ───────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { result, loading, error, lastAnalysedAt, cacheReady, analyse } = useInsights(year, month);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  function goToPrev() {
    const prev = addMonths(year, month, -1);
    setYear(prev.year);
    setMonth(prev.month);
  }

  function goToNext() {
    if (isCurrentMonth) return;
    const next = addMonths(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  }

  function goToThisMonth() {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

      {/* ── Month Header ── */}
      <View style={styles.monthHeader}>
        <Text style={styles.eyebrow}>MONTHLY INSIGHTS</Text>
        <Text style={styles.monthTitle}>{monthLabel}</Text>
        <View style={styles.navRow}>
          <Pressable
            onPress={goToPrev}
            style={styles.navBtn}
            android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.onSurface} />
          </Pressable>

          <Pressable onPress={goToThisMonth} disabled={isCurrentMonth}>
            <Text style={[styles.navLabel, isCurrentMonth && styles.navLabelActive]}>
              {isCurrentMonth ? 'This Month' : 'Go to Today'}
            </Text>
          </Pressable>

          <Pressable
            onPress={goToNext}
            disabled={isCurrentMonth}
            style={styles.navBtn}
            android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isCurrentMonth ? Colors.surfaceContainerHighest : Colors.onSurface}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!cacheReady ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : result ? (
          <InsightsContent
            result={result}
            lastAnalysedAt={lastAnalysedAt}
            loading={loading}
            onReanalyse={analyse}
          />
        ) : (
          <EmptyState
            monthLabel={MONTH_NAMES[month - 1]}
            loading={loading}
            error={error}
            onAnalyse={analyse}
          />
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
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  loader: {
    marginTop: Spacing.twelve,
  },

  // Month header
  monthHeader: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.one,
  },
  eyebrow: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.primary,
    letterSpacing: 2,
  },
  monthTitle: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayExtraBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginTop: Spacing.one,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  navLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  navLabelActive: {
    color: Colors.primary,
  },

  // Hero card
  heroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.five,
  },
  heroText: {
    flex: 1,
    gap: Spacing.two,
  },
  heroLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  heroHeadline: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleMd,
  },

  // Streaks
  streakRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  streakCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  streakValue: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayExtraBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
  },
  streakLabel: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.primary,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  streakUnit: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },

  // Recommendations
  recoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  recoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recoTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  recoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  recoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  recoText: {
    flex: 1,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },

  // Re-analyse footer
  reanalyseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  lastAnalysed: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  reanalyseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.full,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  reanalyseBtnBusy: { opacity: 0.5 },
  reanalyseBtnLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.twelve,
    gap: Spacing.three,
    paddingHorizontal: Spacing.six,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  emptyBody: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: LineHeight.bodyMd,
  },
  errorText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.tertiary,
    textAlign: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 56,
    paddingHorizontal: Spacing.eight,
    marginTop: Spacing.three,
  },
  ctaBtnBusy: { opacity: 0.6 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },

  bottomSpacer: { height: Spacing.eight },
});
