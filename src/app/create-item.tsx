/**
 * Create Item Screen
 *
 * Lets the user define a new food item and save it to their personal list.
 * Does NOT log a meal — only creates the food_items row.
 * After saving, navigates back so the user can find and log it from the search.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
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
import { createFoodItem } from '@/services/food-items';

type UnitOption = 'g' | 'ml';

// ─── CreateItemScreen ─────────────────────────────────────────────────────────

export default function CreateItemScreen() {
  const [name, setName]           = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState<UnitOption>('g');
  const [kcal, setKcal]           = useState('');
  const [protein, setProtein]     = useState('');
  const [carbs, setCarbs]         = useState('');
  const [fats, setFats]           = useState('');
  const [isCountable, setIsCountable] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const isValid =
    name.trim().length > 0 &&
    Number(kcal) > 0 &&
    Number(servingSize) > 0;

  async function handleSave() {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await createFoodItem({
        name: name.trim(),
        kcal: Number(kcal),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        servingSize: Number(servingSize),
        servingUnit,
        isCountable,
        source: 'manual_search',
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <Text style={styles.headerTitle}>New Food Item</Text>
            <Text style={styles.headerSub}>Visible to all users once saved</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Name ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Homemade granola"
              placeholderTextColor={Colors.onSurfaceVariant}
              returnKeyType="next"
              autoCorrect={false}
            />
          </View>

          {/* ── Serving ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Serving Size <Text style={styles.required}>*</Text></Text>
            <Text style={styles.cardHint}>All nutrition values below are for this serving amount.</Text>
            <View style={styles.servingRow}>
              <TextInput
                style={[styles.input, styles.servingInput]}
                value={servingSize}
                onChangeText={(t) => setServingSize(t.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                selectTextOnFocus
                returnKeyType="next"
              />
              <View style={styles.unitToggle}>
                {(['g', 'ml'] as UnitOption[]).map((u) => (
                  <Pressable
                    key={u}
                    style={[styles.unitOption, servingUnit === u && styles.unitOptionActive]}
                    onPress={() => setServingUnit(u)}
                    android_ripple={{ color: Colors.primaryContainer }}
                  >
                    <Text style={[styles.unitLabel, servingUnit === u && styles.unitLabelActive]}>
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* ── Calories ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Calories (kcal) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={kcal}
              onChangeText={(t) => setKcal(t.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              placeholderTextColor={Colors.onSurfaceVariant}
              keyboardType="decimal-pad"
              selectTextOnFocus
              returnKeyType="next"
            />
          </View>

          {/* ── Macros ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Macros (g per serving)</Text>
            <View style={styles.macroRow}>
              <MacroInput label="Protein" value={protein} onChange={setProtein} />
              <MacroInput label="Carbs"   value={carbs}   onChange={setCarbs}   />
              <MacroInput label="Fats"    value={fats}    onChange={setFats}    />
            </View>
          </View>

          {/* ── Countable toggle ── */}
          <View style={[styles.card, styles.switchCard]}>
            <View style={styles.switchText}>
              <Text style={styles.cardTitle}>Countable item</Text>
              <Text style={styles.cardHint}>
                Enable if this is a whole piece (e.g. egg, banana). The serving size above will be treated as the weight of 1 piece.
              </Text>
            </View>
            <Switch
              value={isCountable}
              onValueChange={setIsCountable}
              trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
              thumbColor={isCountable ? Colors.primary : Colors.onSurfaceVariant}
            />
          </View>

          {/* ── Error ── */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.tertiary} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── CTA ── */}
          <Pressable
            style={[styles.cta, (!isValid || loading) && styles.ctaDisabled]}
            onPress={handleSave}
            disabled={!isValid || loading}
            android_ripple={{ color: Colors.primaryContainer }}
          >
            {loading
              ? <ActivityIndicator size="small" color={Colors.onPrimary} />
              : <Ionicons name="checkmark-circle" size={20} color={Colors.onPrimary} />
            }
            <Text style={styles.ctaLabel}>
              {loading ? 'Saving…' : 'Save Item'}
            </Text>
          </Pressable>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── MacroInput ───────────────────────────────────────────────────────────────

type MacroInputProps = { label: string; value: string; onChange: (v: string) => void };

function MacroInput({ label, value, onChange }: MacroInputProps) {
  return (
    <View style={miStyles.root}>
      <Text style={miStyles.label}>{label}</Text>
      <TextInput
        style={miStyles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
        placeholder="0"
        placeholderTextColor={Colors.onSurfaceVariant}
        keyboardType="decimal-pad"
        selectTextOnFocus
        returnKeyType="next"
      />
      <Text style={miStyles.unit}>g</Text>
    </View>
  );
}

const miStyles = StyleSheet.create({
  root: {
    flex: 1,
    gap: Spacing.one,
  },
  label: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  unit: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
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
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  cardHint: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  required: {
    color: Colors.tertiary,
  },

  // Inputs
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 48,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },

  // Serving row
  servingRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  servingInput: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  unitOption: {
    paddingHorizontal: Spacing.four,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitOptionActive: { backgroundColor: Colors.primaryContainer },
  unitLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  unitLabelActive: { color: Colors.onPrimaryContainer },

  // Macros
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },

  // Countable switch
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  switchText: { flex: 1, gap: 2 },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.tertiary,
  },

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
    marginTop: Spacing.two,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
  },

  bottomSpacer: { height: Spacing.eight },
});
