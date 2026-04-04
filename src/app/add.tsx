/**
 * Add Meal Screen
 *
 * Two modes:
 *  - Camera: live CameraView → capture → mock AI result card → confirm & log
 *  - Manual: search bar + food list (mock data, real DB later)
 *
 * Camera flow:  viewfinder → [capture] → result card
 * Manual flow:  search input → filtered food list → [+] to log
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
import { Meal, MealType } from '@/types/nutrition';

// ─── Mock data ────────────────────────────────────────────────────────────────

type FoodItem = {
  id: string;
  name: string;
  kcal: number;
  category: string;
  macros: { protein: number; carbs: number; fats: number };
};

const MOCK_FOODS: FoodItem[] = [
  { id: '1',  name: 'Avocado Toast',         kcal: 320, category: 'Breakfast', macros: { protein: 12, carbs: 28, fats: 18 } },
  { id: '2',  name: 'Greek Yogurt Parfait',  kcal: 210, category: 'Breakfast', macros: { protein: 14, carbs: 28, fats: 5  } },
  { id: '3',  name: 'Oatmeal with Berries',  kcal: 280, category: 'Breakfast', macros: { protein: 8,  carbs: 48, fats: 6  } },
  { id: '4',  name: 'Chicken Caesar Salad',  kcal: 450, category: 'Lunch',     macros: { protein: 38, carbs: 14, fats: 24 } },
  { id: '5',  name: 'Brown Rice Bowl',       kcal: 380, category: 'Lunch',     macros: { protein: 8,  carbs: 74, fats: 4  } },
  { id: '6',  name: 'Mediterranean Wrap',    kcal: 490, category: 'Lunch',     macros: { protein: 22, carbs: 54, fats: 18 } },
  { id: '7',  name: 'Grilled Salmon',        kcal: 520, category: 'Dinner',    macros: { protein: 52, carbs: 0,  fats: 34 } },
  { id: '8',  name: 'Pasta Bolognese',       kcal: 680, category: 'Dinner',    macros: { protein: 36, carbs: 72, fats: 22 } },
  { id: '9',  name: 'Steamed Ginger Sea Bass', kcal: 420, category: 'Dinner', macros: { protein: 44, carbs: 12, fats: 18 } },
  { id: '10', name: 'Protein Shake',         kcal: 180, category: 'Snack',     macros: { protein: 25, carbs: 10, fats: 3  } },
  { id: '11', name: 'Mixed Nuts (30g)',       kcal: 180, category: 'Snack',     macros: { protein: 5,  carbs: 6,  fats: 16 } },
  { id: '12', name: 'Banana',                kcal: 105, category: 'Snack',     macros: { protein: 1,  carbs: 27, fats: 0  } },
];

const MOCK_AI_RESULT = {
  name: 'Avocado Toast',
  kcal: 320,
  confidence: 94,
  mealType: 'BREAKFAST' as MealType,
  macros: { protein: 12, carbs: 14, fats: 16 },
};

const MEAL_TYPE_COLOR: Record<string, string> = {
  BREAKFAST: Colors.secondary,
  LUNCH: Colors.primary,
  DINNER: Colors.onSurface,
  SNACK: Colors.tertiary,
};

const CATEGORY_ICON: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '🌞',
  Dinner: '🌙',
  Snack: '🍎',
};

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
            android_ripple={{ color: Colors.primaryContainer }}
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
  optionActive: {
    backgroundColor: Colors.primaryContainer,
  },
  label: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  labelActive: {
    color: Colors.onPrimaryContainer,
  },
});

// ─── Camera Pane ──────────────────────────────────────────────────────────────

type CameraState = 'viewfinder' | 'analyzing' | 'result';

function CameraPane() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraState, setCameraState] = useState<CameraState>('viewfinder');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

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

  // ── Capture handler
  async function handleCapture() {
    try {
      setCameraState('analyzing');
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        // Simulate AI processing delay
        await new Promise((r) => setTimeout(r, 1200));
        setCameraState('result');
      } else {
        setCameraState('viewfinder');
      }
    } catch {
      setCameraState('viewfinder');
    }
  }

  // ── Analyzing overlay
  if (cameraState === 'analyzing') {
    return (
      <View style={cpStyles.centered}>
        <View style={cpStyles.analyzingCard}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={cpStyles.analyzingTitle}>Analysing meal…</Text>
          <Text style={cpStyles.analyzingSub}>AI is identifying your food</Text>
        </View>
      </View>
    );
  }

  // ── Result card
  if (cameraState === 'result') {
    return (
      <ResultCard
        photoUri={photoUri}
        onRetake={() => { setCameraState('viewfinder'); setPhotoUri(null); }}
        onConfirm={() => { setCameraState('viewfinder'); setPhotoUri(null); }}
      />
    );
  }

  // ── Viewfinder
  return (
    <View style={cpStyles.viewfinder}>
      <CameraView
        ref={cameraRef}
        style={cpStyles.camera}
        facing="back"
      >
        {/* Corner guides */}
        <View style={cpStyles.guideTopLeft} />
        <View style={cpStyles.guideTopRight} />
        <View style={cpStyles.guideBottomLeft} />
        <View style={cpStyles.guideBottomRight} />

        {/* Hint */}
        <View style={cpStyles.hint}>
          <Text style={cpStyles.hintText}>Point at your meal</Text>
        </View>
      </CameraView>

      {/* Capture button */}
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
  analyzingCard: {
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
  analyzingTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  analyzingSub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  // ── Viewfinder ──────────────────────────────────────────────────────────────
  viewfinder: {
    flex: 1,
  },
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
  // Corner guide marks
  guideTopLeft:     { position: 'absolute', top: 24,    left: 24,    width: 22, height: 22, borderTopWidth: 2.5,    borderLeftWidth: 2.5,   borderColor: '#ffffff', borderTopLeftRadius: 4     },
  guideTopRight:    { position: 'absolute', top: 24,    right: 24,   width: 22, height: 22, borderTopWidth: 2.5,    borderRightWidth: 2.5,  borderColor: '#ffffff', borderTopRightRadius: 4    },
  guideBottomLeft:  { position: 'absolute', bottom: 24, left: 24,    width: 22, height: 22, borderBottomWidth: 2.5, borderLeftWidth: 2.5,   borderColor: '#ffffff', borderBottomLeftRadius: 4  },
  guideBottomRight: { position: 'absolute', bottom: 24, right: 24,   width: 22, height: 22, borderBottomWidth: 2.5, borderRightWidth: 2.5,  borderColor: '#ffffff', borderBottomRightRadius: 4 },
  // Capture
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

// ─── Result Card ──────────────────────────────────────────────────────────────

type ResultCardProps = {
  photoUri: string | null;
  onRetake: () => void;
  onConfirm: () => void;
};

function ResultCard({ photoUri, onRetake, onConfirm }: ResultCardProps) {
  const result = MOCK_AI_RESULT;
  const typeColor = MEAL_TYPE_COLOR[result.mealType.toUpperCase()] ?? Colors.primary;

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

        {/* Retake button */}
        <Pressable style={rcStyles.retakeBtn} onPress={onRetake}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={rcStyles.retakeBtnLabel}>Retake</Text>
        </Pressable>

        {/* AI badge overlay */}
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

      {/* ── Stats row ── */}
      <View style={rcStyles.statsRow}>
        <View style={rcStyles.statCard}>
          <Text style={rcStyles.statValue}>{result.confidence}%</Text>
          <Text style={rcStyles.statLabel}>CONFIDENCE</Text>
        </View>
        <View style={rcStyles.statDivider} />
        <View style={rcStyles.statCard}>
          <Ionicons
            name={result.mealType === 'BREAKFAST' ? 'sunny' : result.mealType === 'LUNCH' ? 'partly-sunny' : 'moon'}
            size={20}
            color={typeColor}
          />
          <Text style={[rcStyles.statValue, { color: typeColor }]}>
            {result.mealType.charAt(0) + result.mealType.slice(1).toLowerCase()}
          </Text>
          <Text style={rcStyles.statLabel}>TIME OF DAY</Text>
        </View>
      </View>

      {/* ── Macro mix ── */}
      <View style={rcStyles.macroCard}>
        <View style={rcStyles.macroHeader}>
          <Text style={rcStyles.macroTitle}>Macro Mix</Text>
          <Text style={rcStyles.macroSub}>Estimated from visual scan</Text>
        </View>
        <View style={rcStyles.macroChips}>
          <MacroChip label="PROTEIN" value={result.macros.protein} unit="g" />
          <MacroChip label="CARBS"   value={result.macros.carbs}   unit="g" />
          <MacroChip label="FATS"    value={result.macros.fats}    unit="g" />
          <MacroChip label="KCAL"    value={result.kcal}            unit=""  highlight />
        </View>
      </View>

      {/* ── CTA ── */}
      <Pressable style={rcStyles.ctaBtn} onPress={onConfirm} android_ripple={{ color: Colors.primaryContainer }}>
        <Text style={rcStyles.ctaLabel}>Confirm & Log Meal</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
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
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
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
    backgroundColor: Colors.outlineVariant,
    opacity: 0.4,
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
  macroHeader: {
    gap: 2,
  },
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
  chipHighlight: {
    backgroundColor: Colors.primaryContainer,
  },
  chipValue: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  chipValueHighlight: {
    color: Colors.onPrimaryContainer,
  },
  chipLabel: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  chipLabelHighlight: {
    color: Colors.onPrimaryContainer,
  },

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
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },
});

// ─── Manual Pane ──────────────────────────────────────────────────────────────

function ManualPane() {
  const [query, setQuery] = useState('');

  const filtered = query.trim().length > 0
    ? MOCK_FOODS.filter((f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.category.toLowerCase().includes(query.toLowerCase()),
      )
    : MOCK_FOODS;

  return (
    <View style={mpStyles.root}>
      {/* Search bar */}
      <View style={mpStyles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.onSurfaceVariant} />
        <TextInput
          style={mpStyles.searchInput}
          placeholder="Search foods, meals…"
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

      {/* Section header */}
      {query.trim().length === 0 && (
        <Text style={mpStyles.sectionLabel}>All Foods</Text>
      )}
      {query.trim().length > 0 && (
        <Text style={mpStyles.sectionLabel}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Food list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={mpStyles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={mpStyles.empty}>
            <Text style={mpStyles.emptyIcon}>🔍</Text>
            <Text style={mpStyles.emptyText}>No foods match "{query}"</Text>
            <Text style={mpStyles.emptySub}>Database search coming soon</Text>
          </View>
        }
        renderItem={({ item }) => <FoodRow item={item} />}
      />
    </View>
  );
}

type FoodRowProps = { item: FoodItem };

function FoodRow({ item }: FoodRowProps) {
  const [added, setAdded] = useState(false);

  return (
    <View style={frStyles.row}>
      {/* Icon */}
      <View style={frStyles.icon}>
        <Text style={frStyles.iconEmoji}>
          {CATEGORY_ICON[item.category] ?? '🍽️'}
        </Text>
      </View>

      {/* Info */}
      <View style={frStyles.info}>
        <Text style={frStyles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={frStyles.meta}>
          {item.macros.protein}g P · {item.macros.carbs}g C · {item.macros.fats}g F
        </Text>
      </View>

      {/* Kcal + add */}
      <View style={frStyles.right}>
        <Text style={frStyles.kcal}>{item.kcal}</Text>
        <Text style={frStyles.kcalUnit}>kcal</Text>
      </View>
      <Pressable
        style={[frStyles.addBtn, added && frStyles.addBtnDone]}
        onPress={() => setAdded((v) => !v)}
        android_ripple={{ color: Colors.primaryContainer, borderless: true, radius: 18 }}
        accessibilityLabel={added ? 'Remove' : 'Add'}
      >
        <Ionicons
          name={added ? 'checkmark' : 'add'}
          size={18}
          color={added ? Colors.onPrimaryContainer : Colors.onPrimary}
        />
      </Pressable>
    </View>
  );
}

const mpStyles = StyleSheet.create({
  root: {
    flex: 1,
    gap: Spacing.three,
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
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
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
  info: {
    flex: 1,
    gap: 2,
  },
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
  right: {
    alignItems: 'flex-end',
  },
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
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDone: {
    backgroundColor: Colors.primaryContainer,
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
