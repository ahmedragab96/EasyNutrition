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

import { InsightsContent } from '@/components/insights/insights-content';
import { InsightsEmptyState } from '@/components/insights/insights-empty-state';
import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useInsights } from '@/hooks/use-insights';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function addMonths(year: number, month: number, n: number) {
  const d = new Date(year, month - 1 + n, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
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
          <InsightsEmptyState
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
  bottomSpacer: { height: Spacing.eight },
});
