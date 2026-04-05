/**
 * Add Meal Screen
 *
 * Camera flow:
 *   viewfinder → [capture] → preview (description + meal type) → [Analyse]
 *   → result (AI analysis) → [Confirm & Log] → saved to DB
 *
 * Manual flow: search input → filtered food list → [+] to log
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { useFoodSearch } from '@/hooks/use-food-search';
import { useLogMeal } from '@/hooks/use-log-meal';
import { useMealAnalysis } from '@/hooks/use-meal-analysis';
import { type MealAnalysisResult } from '@/services/meal-analysis';
import { FoodItem, MealType } from '@/types/nutrition';

const CATEGORY_ICON: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '🌞',
  Dinner: '🌙',
  Snack: '🍎',
};

// ─── Shared meal-type helpers ─────────────────────────────────────────────────

const MEAL_TYPE_OPTIONS: { type: MealType; label: string; icon: string }[] = [
  { type: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
  { type: 'LUNCH',     label: 'Lunch',     icon: '🌞' },
  { type: 'DINNER',    label: 'Dinner',    icon: '🌙' },
  { type: 'SNACK',     label: 'Snack',     icon: '🍎' },
];

const MEAL_TYPE_LABEL: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 11) return 'BREAKFAST';
  if (hour >= 11 && hour < 15) return 'LUNCH';
  if (hour >= 18 && hour < 22) return 'DINNER';
  return 'SNACK';
}

function getTodayDateId(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Mode Selector ────────────────────────────────────────────────────────────

type Mode = 'camera' | 'manual';

type ModeSelectorProps = {
  value: Mode;
  onChange: (m: Mode) => void;
};

function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <View style={msStyles.track}>
      {(['camera', 'manual'] as Mode[]).map((m) => {
        const active = value === m;
        return (
          <Pressable
            key={m}
            style={[msStyles.option, active && msStyles.optionActive]}
            onPress={() => onChange(m)}
          >
            <Ionicons
              name={m === 'camera' ? 'camera' : 'search'}
              size={16}
              color={active ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
            />
            <Text style={[msStyles.label, active && msStyles.labelActive]}>
              {m === 'camera' ? 'Camera' : 'Manual'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const msStyles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.full,
    padding: 4,
    gap: 2,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    height: 38,
    borderRadius: Radius.full,
  },
  optionActive: { backgroundColor: Colors.primaryContainer },
  label: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  labelActive: { color: Colors.onPrimaryContainer },
});

// ─── Camera Pane ──────────────────────────────────────────────────────────────

type CameraState = 'viewfinder' | 'preview' | 'result' | 'error';

function CameraPane() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraState, setCameraState] = useState<CameraState>('viewfinder');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<MealAnalysisResult | null>(null);
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType);
  const cameraRef = useRef<CameraView>(null);
  const { analyze } = useMealAnalysis();

  // ── Permission not yet resolved
  if (!permission) {
    return (
      <View style={cpStyles.centered}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  // ── Permission denied
  if (!permission.granted) {
    return (
      <View style={cpStyles.centered}>
        <Ionicons name="camera-outline" size={52} color={Colors.onSurfaceVariant} />
        <Text style={cpStyles.permTitle}>Camera access needed</Text>
        <Text style={cpStyles.permSub}>
          Allow camera access so EasyNutrition can analyse your meal.
        </Text>
        <Pressable style={cpStyles.permBtn} onPress={requestPermission}>
          <Text style={cpStyles.permBtnLabel}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  // ── Step 1: take picture → go to preview
  async function handleCapture() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8, base64: true });
      if (!photo?.uri || !photo?.base64) return;
      setPhotoUri(photo.uri);
      setPhotoBase64(photo.base64);
      setCameraState('preview');
    } catch {
      setCameraState('error');
    }
  }

  // ── Step 2: preview submits → call Claude → go to result
  async function handleAnalyse(description: string, type: MealType) {
    setMealType(type);
    try {
      const result = await analyze({
        imageBase64: photoBase64!,
        mimeType: 'image/jpeg',
        description: description.trim() || undefined,
      });
      setAiResult(result);
      setCameraState('result');
    } catch {
      setCameraState('error');
    }
  }

  function handleReset() {
    setCameraState('viewfinder');
    setPhotoUri(null);
    setPhotoBase64(null);
    setAiResult(null);
  }

  // ── Error
  if (cameraState === 'error') {
    return (
      <View style={cpStyles.centered}>
        <View style={cpStyles.errorCard}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.tertiary} />
          <Text style={cpStyles.errorTitle}>Analysis failed</Text>
          <Text style={cpStyles.errorSub}>Could not identify the meal. Please try again.</Text>
          <Pressable style={cpStyles.permBtn} onPress={handleReset}>
            <Text style={cpStyles.permBtnLabel}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Preview step
  if (cameraState === 'preview') {
    return (
      <PreviewPane
        photoUri={photoUri}
        onRetake={handleReset}
        onAnalyse={handleAnalyse}
      />
    );
  }

  // ── Result step
  if (cameraState === 'result' && aiResult) {
    return (
      <ResultCard
        photoUri={photoUri}
        result={aiResult}
        mealType={mealType}
        onRetake={handleReset}
        onConfirm={handleReset}
      />
    );
  }

  // ── Viewfinder
  return (
    <View style={cpStyles.viewfinder}>
      <CameraView ref={cameraRef} style={cpStyles.camera} facing="back">
        <View style={cpStyles.guideTopLeft} />
        <View style={cpStyles.guideTopRight} />
        <View style={cpStyles.guideBottomLeft} />
        <View style={cpStyles.guideBottomRight} />
        <View style={cpStyles.hint}>
          <Text style={cpStyles.hintText}>Point at your meal</Text>
        </View>
      </CameraView>

      <View style={cpStyles.captureRow}>
        <Pressable
          onPress={handleCapture}
          style={cpStyles.captureBtn}
          accessibilityLabel="Take photo"
          android_ripple={{ color: Colors.primaryContainer, borderless: true, radius: 36 }}
        >
          <View style={cpStyles.captureInner} />
        </Pressable>
      </View>
    </View>
  );
}

const cpStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.eight,
  },
  permTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  permSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: LineHeight.bodyMd,
  },
  permBtn: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  permBtnLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onPrimary,
  },
  errorCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
    width: '80%',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  errorTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  errorSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  viewfinder: { flex: 1 },
  camera: {
    flex: 1,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    top: Spacing.five,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  hintText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: '#ffffff',
  },
  guideTopLeft:     { position: 'absolute', top: 24,    left: 24,    width: 22, height: 22, borderTopWidth: 2.5,    borderLeftWidth: 2.5,   borderColor: '#ffffff', borderTopLeftRadius: 4     },
  guideTopRight:    { position: 'absolute', top: 24,    right: 24,   width: 22, height: 22, borderTopWidth: 2.5,    borderRightWidth: 2.5,  borderColor: '#ffffff', borderTopRightRadius: 4    },
  guideBottomLeft:  { position: 'absolute', bottom: 24, left: 24,    width: 22, height: 22, borderBottomWidth: 2.5, borderLeftWidth: 2.5,   borderColor: '#ffffff', borderBottomLeftRadius: 4  },
  guideBottomRight: { position: 'absolute', bottom: 24, right: 24,   width: 22, height: 22, borderBottomWidth: 2.5, borderRightWidth: 2.5,  borderColor: '#ffffff', borderBottomRightRadius: 4 },
  captureRow: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
  },
});

// ─── Preview Pane ─────────────────────────────────────────────────────────────

type PreviewPaneProps = {
  photoUri: string | null;
  onRetake: () => void;
  onAnalyse: (description: string, mealType: MealType) => Promise<void>;
};

function PreviewPane({ photoUri, onRetake, onAnalyse }: PreviewPaneProps) {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleSubmit() {
    setAnalyzing(true);
    try {
      await onAnalyse(description, mealType);
    } catch {
      setAnalyzing(false);
    }
  }

  return (
    <ScrollView
      style={pvStyles.scroll}
      contentContainerStyle={pvStyles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Photo preview ── */}
      <View style={pvStyles.photoCard}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={pvStyles.photo} resizeMode="cover" />
        ) : (
          <View style={pvStyles.photoPlaceholder}>
            <Ionicons name="image-outline" size={48} color={Colors.onSurfaceVariant} />
          </View>
        )}
        <Pressable style={pvStyles.retakeBtn} onPress={onRetake} disabled={analyzing}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={pvStyles.retakeBtnLabel}>Retake</Text>
        </Pressable>
      </View>

      {/* ── Description ── */}
      <View style={pvStyles.card}>
        <Text style={pvStyles.cardTitle}>
          Add a note{'  '}
          <Text style={pvStyles.cardOptional}>optional</Text>
        </Text>
        <TextInput
          style={pvStyles.descInput}
          placeholder='"large portion", "no dressing", "shared with 2"…'
          placeholderTextColor={Colors.onSurfaceVariant}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          returnKeyType="done"
          blurOnSubmit
          editable={!analyzing}
        />
      </View>

      {/* ── Meal type ── */}
      <View style={pvStyles.card}>
        <Text style={pvStyles.cardTitle}>Meal Type</Text>
        <View style={pvStyles.pillRow}>
          {MEAL_TYPE_OPTIONS.map((opt) => {
            const active = mealType === opt.type;
            return (
              <Pressable
                key={opt.type}
                style={[pvStyles.pill, active && pvStyles.pillActive]}
                onPress={() => setMealType(opt.type)}
                disabled={analyzing}
                android_ripple={{ color: Colors.primaryContainer, borderless: false }}
              >
                <Text style={pvStyles.pillIcon}>{opt.icon}</Text>
                <Text style={[pvStyles.pillLabel, active && pvStyles.pillLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Analyse CTA ── */}
      <Pressable
        style={[pvStyles.ctaBtn, analyzing && pvStyles.ctaBtnBusy]}
        onPress={handleSubmit}
        disabled={analyzing}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {analyzing
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="sparkles" size={18} color={Colors.onPrimary} />
        }
        <Text style={pvStyles.ctaLabel}>
          {analyzing ? 'Analysing…' : 'Analyse Meal'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const pvStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.three, paddingBottom: Spacing.four },

  photoCard: {
    height: 220,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHighest,
  },
  photo: { ...StyleSheet.absoluteFillObject },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  cardOptional: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },

  descInput: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 64,
    textAlignVertical: 'top',
  },

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

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 52,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaBtnBusy: { opacity: 0.75 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },
});

// ─── Result Card ──────────────────────────────────────────────────────────────

type ResultCardProps = {
  photoUri: string | null;
  result: MealAnalysisResult;
  mealType: MealType;
  onRetake: () => void;
  onConfirm: () => void;
};

function ResultCard({ photoUri, result, mealType, onRetake, onConfirm }: ResultCardProps) {
  const { logFromScan, loading: logging } = useLogMeal();

  async function handleConfirm() {
    try {
      await logFromScan({
        name: result.name,
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
      // error held in hook; could surface inline if needed
    }
  }

  return (
    <ScrollView
      style={rcStyles.scroll}
      contentContainerStyle={rcStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Photo card ── */}
      <View style={rcStyles.photoCard}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={rcStyles.photo} resizeMode="cover" />
        ) : (
          <View style={rcStyles.photoPlaceholder}>
            <Ionicons name="image-outline" size={48} color={Colors.onSurfaceVariant} />
          </View>
        )}

        <Pressable style={rcStyles.retakeBtn} onPress={onRetake}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={rcStyles.retakeBtnLabel}>Retake</Text>
        </Pressable>

        <View style={rcStyles.aiBadge}>
          <View style={rcStyles.aiBadgeInner}>
            <Ionicons name="sparkles" size={11} color={Colors.onPrimary} />
            <Text style={rcStyles.aiBadgeText}>AI ANALYSIS</Text>
          </View>
          <Text style={rcStyles.aiMealLabel}>
            {result.name}
            <Text style={rcStyles.aiMealKcal}> — {result.kcal} kcal</Text>
          </Text>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={rcStyles.statsRow}>
        <View style={rcStyles.statCard}>
          <Text style={rcStyles.statValue}>{result.confidence}%</Text>
          <Text style={rcStyles.statLabel}>AI CONFIDENCE</Text>
        </View>
        <View style={rcStyles.statDivider} />
        <View style={rcStyles.statCard}>
          <Text style={rcStyles.statValue}>{MEAL_TYPE_LABEL[mealType]}</Text>
          <Text style={rcStyles.statLabel}>MEAL TYPE</Text>
        </View>
      </View>

      {/* ── Macro mix ── */}
      <View style={rcStyles.macroCard}>
        <View style={rcStyles.macroHeader}>
          <Text style={rcStyles.macroTitle}>Macro Mix</Text>
          <Text style={rcStyles.macroSub}>Estimated from visual scan</Text>
        </View>
        <View style={rcStyles.macroChips}>
          <MacroChip label="PROTEIN" value={result.protein} unit="g" />
          <MacroChip label="CARBS"   value={result.carbs}   unit="g" />
          <MacroChip label="FATS"    value={result.fats}    unit="g" />
          <MacroChip label="KCAL"    value={result.kcal}    unit=""  highlight />
        </View>
      </View>

      {/* ── CTA ── */}
      <Pressable
        style={[rcStyles.ctaBtn, logging && rcStyles.ctaBtnBusy]}
        onPress={handleConfirm}
        disabled={logging}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {logging
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
        }
        <Text style={rcStyles.ctaLabel}>
          {logging ? 'Logging…' : 'Confirm & Log Meal'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

type MacroChipProps = { label: string; value: number; unit: string; highlight?: boolean };

function MacroChip({ label, value, unit, highlight }: MacroChipProps) {
  return (
    <View style={[rcStyles.chip, highlight && rcStyles.chipHighlight]}>
      <Text style={[rcStyles.chipValue, highlight && rcStyles.chipValueHighlight]}>
        {value}{unit}
      </Text>
      <Text style={[rcStyles.chipLabel, highlight && rcStyles.chipLabelHighlight]}>{label}</Text>
    </View>
  );
}

const rcStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.three, paddingBottom: Spacing.four },

  // ── Photo ───────────────────────────────────────────────────────────────────
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

  // ── Stats ───────────────────────────────────────────────────────────────────
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
  statDivider: {
    width: 1,
    backgroundColor: Colors.onSurfaceVariant,
    opacity: 0.2,
    marginVertical: Spacing.three,
  },
  statValue: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleMd,
  },
  statLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },

  // ── Macros ──────────────────────────────────────────────────────────────────
  macroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  macroHeader: { gap: 2 },
  macroTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  macroSub: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  macroChips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  chipHighlight: { backgroundColor: Colors.primaryContainer },
  chipValue: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  chipValueHighlight: { color: Colors.onPrimaryContainer },
  chipLabel: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  chipLabelHighlight: { color: Colors.onPrimaryContainer },

  // ── CTA ─────────────────────────────────────────────────────────────────────
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 52,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaBtnBusy: { opacity: 0.75 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },
});

// ─── Manual Pane ──────────────────────────────────────────────────────────────

function ManualPane() {
  const [query, setQuery] = useState('');
  const { results, loading, isShowingRecent } = useFoodSearch(query);
  const hasQuery = query.trim().length > 0;

  return (
    <View style={mpStyles.root}>
      {/* ── Search bar + Add button ── */}
      <View style={mpStyles.topRow}>
        <View style={[mpStyles.searchBar, mpStyles.searchBarFlex]}>
          <Ionicons name="search" size={18} color={Colors.onSurfaceVariant} />
        <TextInput
          style={mpStyles.searchInput}
          placeholder="Search foods you've logged…"
          placeholderTextColor={Colors.onSurfaceVariant}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.onSurfaceVariant} />
          </Pressable>
        )}
        </View>
        <Pressable
          style={mpStyles.addItemBtn}
          onPress={() => router.push('/create-item')}
          android_ripple={{ color: Colors.primaryContainer, borderless: true, radius: 22 }}
          accessibilityLabel="Add new food item"
        >
          <Ionicons name="add" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {!loading && (
        <Text style={mpStyles.sectionLabel}>
          {isShowingRecent
            ? results.length > 0 ? 'QUICK ADD' : ''
            : `${results.length} result${results.length !== 1 ? 's' : ''}`}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.six }} />
      ) : isShowingRecent && results.length === 0 ? (
        <View style={mpStyles.empty}>
          <Text style={mpStyles.emptyIcon}>🍽️</Text>
          <Text style={mpStyles.emptyText}>No meals logged yet</Text>
          <Text style={mpStyles.emptySub}>Use the camera to scan and log your first meal</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={mpStyles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={mpStyles.empty}>
              <Text style={mpStyles.emptyIcon}>🔍</Text>
              <Text style={mpStyles.emptyText}>No results for "{query}"</Text>
              <Text style={mpStyles.emptySub}>Try the camera to scan and log a new meal</Text>
            </View>
          }
          renderItem={({ item }) => <FoodRow item={item} />}
        />
      )}
    </View>
  );
}

type FoodRowProps = { item: FoodItem };

function FoodRow({ item }: FoodRowProps) {
  function handlePress() {
    router.push({
      pathname: '/log-item',
      params: {
        id: item.id,
        name: item.name,
        kcal: String(item.kcal),
        protein: String(item.macros.protein),
        carbs: String(item.macros.carbs),
        fats: String(item.macros.fats),
        servingSize: String(item.servingSize ?? 100),
        servingUnit: item.servingUnit ?? 'g',
        isCountable: item.isCountable ? '1' : '0',
        category: item.category ?? '',
      },
    });
  }

  return (
    <Pressable
      style={frStyles.row}
      onPress={handlePress}
      android_ripple={{ color: Colors.surfaceContainerHigh }}
    >
      <View style={frStyles.icon}>
        <Text style={frStyles.iconEmoji}>
          {item.category ? (CATEGORY_ICON[item.category] ?? '🍽️') : '🍽️'}
        </Text>
      </View>

      <View style={frStyles.info}>
        <Text style={frStyles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={frStyles.meta}>
          {item.macros.protein}g P · {item.macros.carbs}g C · {item.macros.fats}g F
        </Text>
      </View>

      <View style={frStyles.right}>
        <Text style={frStyles.kcal}>{item.kcal}</Text>
        <Text style={frStyles.kcalUnit}>kcal</Text>
      </View>

      <View style={frStyles.addBtn}>
        <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceVariant} />
      </View>
    </Pressable>
  );
}

const mpStyles = StyleSheet.create({
  root: { flex: 1, gap: Spacing.three },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 48,
  },
  searchBarFlex: { flex: 1 },
  addItemBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },
  sectionLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
  },
  list: { gap: Spacing.two, paddingBottom: Spacing.four },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.ten,
    gap: Spacing.two,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
});

const frStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  meta: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  right: { alignItems: 'flex-end' },
  kcal: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleSm,
  },
  kcalUnit: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── AddScreen ────────────────────────────────────────────────────────────────

export default function AddScreen() {
  const [mode, setMode] = useState<Mode>('camera');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Log Meal</Text>
        <ModeSelector value={mode} onChange={setMode} />
      </View>

      <View style={styles.body}>
        {mode === 'camera' ? <CameraPane /> : <ManualPane />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
    letterSpacing: -0.3,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.two,
  },
});
