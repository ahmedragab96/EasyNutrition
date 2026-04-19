import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { useBarcodeLookup } from '@/hooks/use-barcode-lookup';
import { useLogMeal } from '@/hooks/use-log-meal';
import { BarcodeProduct } from '@/services/barcode-lookup';
import { MealType } from '@/types/nutrition';
import { getTodayDateId } from '../add-shared/add-constants';
import { CameraErrorView, CameraPermissionView, DateSelector, MacroChip, MealTypePills } from '../add-shared/add-shared';
import { cardStyles, chipStyles } from '../add-shared/add-shared.styles';

// ─── BarcodeScanPane ──────────────────────────────────────────────────────────

export function BarcodeScanPane() {
  const [permission, requestPermission] = useCameraPermissions();
  const { lookup, product, state, reset } = useBarcodeLookup();
  const [mealType, setMealType] = useState<MealType | null>(null);
  const scannedRef = useRef(false);

  function handleBarcodeScan({ data }: BarcodeScanningResult) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    lookup(data);
  }

  function handleReset() {
    scannedRef.current = false;
    reset();
  }

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <CameraPermissionView
        icon="barcode-outline"
        subtitle="Allow camera access to scan barcodes."
        onGrant={requestPermission}
      />
    );
  }

  if (state === 'found' && product) {
    return (
      <BarcodeResultCard
        product={product}
        mealType={mealType}
        onMealTypeChange={setMealType}
        onScanAgain={handleReset}
      />
    );
  }

  if (state === 'not_found') {
    return (
      <CameraErrorView
        icon="search-outline"
        title="Product not found"
        subtitle="This barcode isn't in the Open Food Facts database yet. Try adding it manually."
        actionLabel="Scan Again"
        onAction={handleReset}
      />
    );
  }

  if (state === 'error') {
    return (
      <CameraErrorView
        icon="alert-circle-outline"
        title="Lookup failed"
        subtitle="Check your connection and try again."
        actionLabel="Try Again"
        onAction={handleReset}
        iconColor={Colors.tertiary}
      />
    );
  }

  // Scanner viewfinder
  return (
    <View style={styles.viewfinder}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={state === 'loading' ? undefined : handleBarcodeScan}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
      >
        <View style={styles.guideTopLeft} />
        <View style={styles.guideTopRight} />
        <View style={styles.guideBottomLeft} />
        <View style={styles.guideBottomRight} />
        <View style={styles.scanLine} />
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            {state === 'loading' ? 'Looking up product…' : 'Point at a barcode'}
          </Text>
        </View>
      </CameraView>
      {state === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

// ─── BarcodeResultCard ────────────────────────────────────────────────────────

type BarcodeResultCardProps = {
  product: BarcodeProduct;
  mealType: MealType | null;
  onMealTypeChange: (t: MealType) => void;
  onScanAgain: () => void;
};

function BarcodeResultCard({ product, mealType, onMealTypeChange, onScanAgain }: BarcodeResultCardProps) {
  const { logFromScan, loading } = useLogMeal();
  const [amountStr, setAmountStr] = useState('100');
  const [dateId, setDateId] = useState(getTodayDateId());

  const amount = parseFloat(amountStr) || 0;
  const quantity = amount / 100;
  const unit = product.servingUnit === 'ml' ? 'ml' : 'g';

  const preview = {
    kcal:    Math.round(product.kcal    * quantity),
    protein: Math.round(product.protein * quantity * 10) / 10,
    carbs:   Math.round(product.carbs   * quantity * 10) / 10,
    fats:    Math.round(product.fats    * quantity * 10) / 10,
  };

  async function handleConfirm() {
    if (!mealType || amount <= 0) return;
    try {
      await logFromScan({
        name: product.brand ? `${product.name} — ${product.brand}` : product.name,
        description: product.description,
        kcal: product.kcal,
        protein: product.protein,
        carbs: product.carbs,
        fats: product.fats,
        servingSize: product.servingSize,
        servingUnit: product.servingUnit,
        source: 'barcode',
        mealType,
        dateId,
        quantity,
      });
      onScanAgain();
    } catch {
      // error held in hook
    }
  }

  return (
    <ScrollView
      style={cardStyles.scroll}
      contentContainerStyle={cardStyles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Product info ── */}
      <View style={styles.productCard}>
        <View style={styles.barcodeBadge}>
          <Ionicons name="barcode-outline" size={13} color={Colors.onPrimary} />
          <Text style={styles.barcodeBadgeText}>BARCODE SCAN</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
        <Text style={styles.productServing}>Nutrition per 100 {unit}</Text>
      </View>

      {/* ── Ingredients ── */}
      {product.description ? (
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Ingredients</Text>
          <Text style={styles.ingredientsText}>{product.description}</Text>
        </View>
      ) : null}

      {/* ── Amount input ── */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Amount consumed</Text>
        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={amountStr}
            onChangeText={(t) => setAmountStr(t.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            selectTextOnFocus
            returnKeyType="done"
          />
          <Text style={styles.amountUnit}>{unit}</Text>
        </View>
      </View>

      {/* ── Nutrition preview ── */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>
          Nutritional values
          <Text style={styles.cardSubInline}> for {amount > 0 ? amount : '–'} {unit}</Text>
        </Text>
        <View style={chipStyles.row}>
          <MacroChip label="KCAL"    value={preview.kcal}    unit=""  highlight />
          <MacroChip label="PROTEIN" value={preview.protein} unit="g" />
          <MacroChip label="CARBS"   value={preview.carbs}   unit="g" />
          <MacroChip label="FATS"    value={preview.fats}    unit="g" />
        </View>
      </View>

      {/* ── Meal type ── */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Meal Type</Text>
        <MealTypePills value={mealType} onChange={onMealTypeChange} />
      </View>

      {/* ── Date ── */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Log Date</Text>
        <DateSelector value={dateId} onChange={setDateId} />
      </View>

      {/* ── CTAs ── */}
      <Pressable
        style={[cardStyles.ctaBtn, (!mealType || loading || amount <= 0) && cardStyles.ctaBtnBusy]}
        onPress={handleConfirm}
        disabled={!mealType || loading || amount <= 0}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {loading
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
        }
        <Text style={cardStyles.ctaLabel}>
          {loading ? 'Logging…' : `Log ${preview.kcal} kcal`}
        </Text>
      </Pressable>

      <Pressable style={styles.scanAgainBtn} onPress={onScanAgain}>
        <Ionicons name="barcode-outline" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.scanAgainLabel}>Scan a different product</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { flex: 1 },
  camera: { flex: 1, borderRadius: Radius.xxl, overflow: 'hidden' },
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
  scanLine: {
    position: 'absolute',
    top: '48%',
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.8,
    borderRadius: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,250,242,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.five,
    gap: Spacing.two,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  barcodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  barcodeBadgeText: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onPrimary,
    letterSpacing: 0.8,
  },
  productName: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  productBrand: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  productServing: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
    marginTop: Spacing.one,
  },
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
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  ingredientsText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
  cardSubInline: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  scanAgainLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
});
