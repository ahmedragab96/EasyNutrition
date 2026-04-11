import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { useLogMeal } from '@/hooks/use-log-meal';
import { type MealAnalysisResult } from '@/services/meal-analysis';
import { MealType } from '@/types/nutrition';
import { getTodayDateId } from '../add-shared/add-constants';
import { MacroChip, MealTypePills } from '../add-shared/add-shared';
import { cardStyles, chipStyles } from '../add-shared/add-shared.styles';

type AiResultCardProps = {
  photoUri: string | null;
  result: MealAnalysisResult;
  onRetake: () => void;
  onConfirm: () => void;
};

export function AiResultCard({ photoUri, result, onRetake, onConfirm }: AiResultCardProps) {
  const { logFromScan, loading } = useLogMeal();
  const [mealType, setMealType] = useState<MealType | null>(null);

  async function handleConfirm() {
    if (!mealType) return;
    try {
      await logFromScan({
        name: result.name,
        description: result.description,
        kcal: result.kcal,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        aiConfidence: result.confidence,
        mealType,
        dateId: getTodayDateId(),
      });
      onConfirm();
    } catch {
      // error held in hook
    }
  }

  return (
    <ScrollView
      style={cardStyles.scroll}
      contentContainerStyle={cardStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Photo + AI badge ── */}
      <View style={styles.photoCard}>
        {photoUri
          ? <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          : <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={48} color={Colors.onSurfaceVariant} />
            </View>
        }
        <Pressable style={styles.retakeBtn} onPress={onRetake}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={styles.retakeBtnLabel}>Retake</Text>
        </Pressable>
        <View style={styles.aiBadge}>
          <View style={styles.aiBadgeInner}>
            <Ionicons name="sparkles" size={11} color={Colors.onPrimary} />
            <Text style={styles.aiBadgeText}>AI ANALYSIS</Text>
          </View>
          <Text style={styles.aiMealLabel}>
            {result.name}
            <Text style={styles.aiMealKcal}> — {result.kcal} kcal</Text>
          </Text>
        </View>
      </View>

      {/* ── Confidence ── */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { paddingHorizontal: Spacing.six }]}>
          <Text style={styles.statValue}>{result.confidence}%</Text>
          <Text style={styles.statLabel}>AI CONFIDENCE</Text>
        </View>
      </View>

      {/* ── Ingredients ── */}
      {result.description ? (
        <View style={cardStyles.card}>
          <View style={styles.cardHeader}>
            <Text style={cardStyles.cardTitle}>Ingredients</Text>
            <Text style={cardStyles.cardSub}>Based on visual analysis</Text>
          </View>
          <Text style={styles.descriptionText}>{result.description}</Text>
        </View>
      ) : null}

      {/* ── Macros ── */}
      <View style={cardStyles.card}>
        <View style={styles.cardHeader}>
          <Text style={cardStyles.cardTitle}>Macro Mix</Text>
          <Text style={cardStyles.cardSub}>Estimated from visual scan</Text>
        </View>
        <View style={chipStyles.row}>
          <MacroChip label="PROTEIN" value={result.protein} unit="g" />
          <MacroChip label="CARBS"   value={result.carbs}   unit="g" />
          <MacroChip label="FATS"    value={result.fats}    unit="g" />
          <MacroChip label="KCAL"    value={result.kcal}    unit=""  highlight />
        </View>
      </View>

      {/* ── Meal type ── */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Meal Type</Text>
        <MealTypePills value={mealType} onChange={setMealType} />
      </View>

      {/* ── CTA ── */}
      <Pressable
        style={[cardStyles.ctaBtn, (!mealType || loading) && cardStyles.ctaBtnBusy]}
        onPress={handleConfirm}
        disabled={!mealType || loading}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {loading
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
        }
        <Text style={cardStyles.ctaLabel}>
          {loading ? 'Logging…' : 'Confirm & Log Meal'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    height: 260,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHighest,
  },
  photo: { ...StyleSheet.absoluteFillObject },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
  },
  retakeBtn: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  retakeBtnLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: '#ffffff',
  },
  aiBadge: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.four,
    gap: Spacing.one,
  },
  aiBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onPrimary,
    letterSpacing: 0.8,
  },
  aiMealLabel: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: '#ffffff',
    lineHeight: LineHeight.titleSm,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  aiMealKcal: {
    fontFamily: FontFamily.displaySemiBold,
    color: 'rgba(255,255,255,0.78)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.four,
  },
  statValue: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  statLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  cardHeader: { gap: 2 },
  descriptionText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
});
