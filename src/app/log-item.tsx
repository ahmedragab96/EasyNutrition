/**
 * Log Item Screen
 *
 * Pushed from the manual food search list.
 * Lets the user choose how much of a food item to log:
 *   - Serving unit toggle: "1 g" (enter grams) or "100 g" (enter portions of 100g)
 *   - Amount text input
 *   - Meal type selector
 *   - Live macro preview
 *   - Log Meal CTA
 *
 * All food items stored in DB are per 100 g.
 * Quantity passed to logMeal = amount / 100 (for 1g mode) or amount (for 100g mode).
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useLogMeal } from '@/hooks/use-log-meal';
import { FoodItem, FoodSource, MealType } from '@/types/nutrition';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MEAL_TYPE_OPTIONS: { type: MealType; label: string; icon: string }[] = [
  { type: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
  { type: 'LUNCH',     label: 'Lunch',     icon: '🌞' },
  { type: 'DINNER',    label: 'Dinner',    icon: '🌙' },
  { type: 'SNACK',     label: 'Snack',     icon: '🍎' },
];


function getTodayDateId(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type ServingUnit = 'piece' | '1g' | '100g';

// ─── LogItemScreen ────────────────────────────────────────────────────────────

export default function LogItemScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    kcal: string;
    protein: string;
    carbs: string;
    fats: string;
    servingSize?: string;
    servingUnit?: string;
    isCountable?: string;
    category?: string;
    source?: string;
  }>();

  const isCountable = params.isCountable === '1';
  const isAiScan = params.source === 'ai_scan';

  // Reconstruct a minimal FoodItem from params
  const item: FoodItem = {
    id: params.id,
    name: params.name,
    kcal: Number(params.kcal),
    macros: {
      protein: Number(params.protein),
      carbs: Number(params.carbs),
      fats: Number(params.fats),
    },
    servingSize: params.servingSize ? Number(params.servingSize) : 100,
    servingUnit: params.servingUnit ?? 'g',
    isCountable,
    category: params.category,
    source: (params.source as FoodSource) ?? 'system',
    isPublic: false,
    createdAt: '',
  };

  const [servingMode, setServingMode] = useState<ServingUnit>(isCountable ? 'piece' : '100g');
  const [amountStr, setAmountStr] = useState('1');
  const [mealType, setMealType] = useState<MealType | null>(null);
  const { logExisting, loading } = useLogMeal();

  // When mode changes, convert the current amount to the new unit
  // so the physical quantity stays the same.
  const prevModeRef = useRef<ServingUnit>(isCountable ? 'piece' : '100g');
  useEffect(() => {
    const prevMode = prevModeRef.current;
    prevModeRef.current = servingMode;
    if (prevMode === servingMode) return;

    const parsed = parseFloat(amountStr) || 0;
    // Compute the physical quantity in base units (g or ml)
    let baseAmount: number;
    if (prevMode === 'piece') baseAmount = parsed * servingSize;
    else if (prevMode === '1g') baseAmount = parsed;
    else baseAmount = parsed * 100; // 100g mode

    // Convert to new mode
    let newAmount: number;
    if (servingMode === 'piece') newAmount = Math.round((baseAmount / servingSize) * 10) / 10;
    else if (servingMode === '1g') newAmount = Math.round(baseAmount);
    else newAmount = Math.round((baseAmount / 100) * 10) / 10; // 100g mode

    setAmountStr(String(newAmount || 1));
  }, [servingMode]);

  const amount = parseFloat(amountStr) || 0;
  const servingSize = item.servingSize ?? 100;
  // 'g' for solids, 'ml' for liquids — drives all unit labels in the UI
  const unitLabel = item.servingUnit === 'ml' ? 'ml' : 'g';

  // quantity = how many "stored servings" the user is logging
  // logMeal does: kcal_snapshot = item.kcal * qty, so qty must be in units of servingSize
  // - piece mode: quantity = count (item stores per-piece values)
  // - 1g mode:   quantity = grams / servingSize
  // - 100g mode: quantity = (portions × 100) / servingSize
  const quantity = useMemo(() => {
    if (servingMode === 'piece') return amount;
    const volume = servingMode === '1g' ? amount : amount * 100;
    return volume / servingSize;
  }, [servingMode, amount, servingSize]);

  const preview = useMemo(() => ({
    kcal:    Math.round(item.kcal * quantity),
    protein: Math.round(item.macros.protein * quantity * 10) / 10,
    carbs:   Math.round(item.macros.carbs   * quantity * 10) / 10,
    fats:    Math.round(item.macros.fats    * quantity * 10) / 10,
  }), [item, quantity]);

  async function handleLog() {
    if (!mealType) return;
    if (!isAiScan && amount <= 0) return;
    try {
      await logExisting({
        foodItem: item,
        mealType: mealType!,
        dateId: getTodayDateId(),
        quantity: isAiScan ? 1 : quantity,
      });
      router.back();
    } catch {
      // error held in hook
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.headerSub}>
              {isAiScan
                ? `AI analysed · ${item.kcal} kcal`
                : isCountable
                  ? `1 piece — ${item.kcal} kcal · per 100 ${unitLabel} — ${Math.round(item.kcal / servingSize * 100)} kcal`
                  : `per 100 ${unitLabel} — ${Math.round(item.kcal / servingSize * 100)} kcal`
              }
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Serving unit toggle (hidden for AI-scanned items) ── */}
          {!isAiScan && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Serving Unit</Text>
              <View style={styles.toggleRow}>
                {(isCountable
                  ? ['piece', '1g', '100g'] as ServingUnit[]
                  : ['1g', '100g'] as ServingUnit[]
                ).map((unit) => {
                  const active = servingMode === unit;
                  return (
                    <Pressable
                      key={unit}
                      style={[styles.toggleOption, active && styles.toggleOptionActive]}
                      onPress={() => setServingMode(unit)}
                    >
                      <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                        {unit === 'piece' ? 'Piece' : unit === '1g' ? `Per ${unitLabel}` : `Per 100 ${unitLabel}`}
                      </Text>
                      <Text style={[styles.toggleSub, active && styles.toggleSubActive]}>
                        {unit === 'piece' ? 'Count pieces' : unit === '1g' ? `Enter total ${unitLabel}` : `Enter portions of 100 ${unitLabel}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Amount input (hidden for AI-scanned items) ── */}
          {!isAiScan && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Amount</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={styles.amountInput}
                  value={amountStr}
                  onChangeText={(t) => setAmountStr(t.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  returnKeyType="done"
                />
                <View style={styles.amountUnit}>
                  <Text style={styles.amountUnitText}>
                    {servingMode === 'piece'
                      ? `piece${(parseFloat(amountStr) || 0) !== 1 ? 's' : ''}`
                      : servingMode === '1g' ? unitLabel : `× 100 ${unitLabel}`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Nutrition preview ── */}
          <View style={[styles.card, styles.previewCard]}>
            <Text style={styles.cardTitle}>Nutritional Values</Text>
            <View style={styles.macroChips}>
              <NutrientChip label="KCAL"    value={preview.kcal}    unit=""  highlight />
              <NutrientChip label="PROTEIN" value={preview.protein} unit="g" />
              <NutrientChip label="CARBS"   value={preview.carbs}   unit="g" />
              <NutrientChip label="FATS"    value={preview.fats}    unit="g" />
            </View>
          </View>

          {/* ── Meal type ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meal Type</Text>
            <View style={styles.pillRow}>
              {MEAL_TYPE_OPTIONS.map((opt) => {
                const active = mealType === opt.type;
                return (
                  <Pressable
                    key={opt.type}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setMealType(opt.type)}
                  >
                    <Text style={styles.pillIcon}>{opt.icon}</Text>
                    <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── CTA ── */}
          <Pressable
            style={[styles.cta, (!mealType || loading || (!isAiScan && amount <= 0)) && styles.ctaDisabled]}
            onPress={handleLog}
            disabled={!mealType || loading || (!isAiScan && amount <= 0)}
            android_ripple={{ color: Colors.primaryContainer }}
          >
            {loading
              ? <ActivityIndicator size="small" color={Colors.onPrimary} />
              : <Ionicons name="add-circle" size={20} color={Colors.onPrimary} />
            }
            <Text style={styles.ctaLabel}>
              {loading
                ? 'Logging…'
                : !mealType
                  ? 'Select a meal type'
                  : isAiScan
                    ? `Log ${item.kcal} kcal`
                    : `Log ${preview.kcal} kcal`}
            </Text>
          </Pressable>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── NutrientChip ─────────────────────────────────────────────────────────────

type NutrientChipProps = { label: string; value: number; unit: string; highlight?: boolean };

function NutrientChip({ label, value, unit, highlight }: NutrientChipProps) {
  return (
    <View style={[chipStyles.root, highlight && chipStyles.rootHighlight]}>
      <Text style={[chipStyles.value, highlight && chipStyles.valueHighlight]}>
        {value}{unit}
      </Text>
      <Text style={[chipStyles.label, highlight && chipStyles.labelHighlight]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  rootHighlight: { backgroundColor: Colors.primaryContainer },
  value: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleSm,
  },
  valueHighlight: { color: Colors.onPrimaryContainer },
  label: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  labelHighlight: { color: Colors.onPrimaryContainer },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleLg,
  },
  headerSub: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },

  // Card
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  previewCard: { gap: Spacing.three },

  // Serving toggle
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  toggleOption: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.three,
    gap: 2,
  },
  toggleOptionActive: { backgroundColor: Colors.primaryContainer },
  toggleLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  toggleLabelActive: { color: Colors.onPrimaryContainer },
  toggleSub: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  toggleSubActive: { color: Colors.onPrimaryContainer },

  // Amount input
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 56,
  },
  amountInput: {
    flex: 1,
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  amountUnit: {
    paddingLeft: Spacing.two,
  },
  amountUnitText: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },

  // Macro chips
  macroChips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },

  // Meal type pills
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
  },
  pillActive: { backgroundColor: Colors.primaryContainer },
  pillIcon: { fontSize: 18 },
  pillLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  pillLabelActive: { color: Colors.onPrimaryContainer },

  // CTA
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 56,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },

  bottomSpacer: { height: Spacing.eight },
});
