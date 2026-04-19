import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { MealType } from '@/types/nutrition';
import { MealTypePills } from '../add-shared/add-shared';
import { cardStyles } from '../add-shared/add-shared.styles';

type PreviewPaneProps = {
  photoUri: string | null;
  onRetake: () => void;
  onAnalyse: (description: string, mealType: MealType) => Promise<void>;
};

export function PreviewPane({ photoUri, onRetake, onAnalyse }: PreviewPaneProps) {
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleSubmit() {
    if (!mealType) return;
    setAnalyzing(true);
    try {
      await onAnalyse(description, mealType);
    } catch {
      setAnalyzing(false);
    }
  }

  return (
    <ScrollView
      style={cardStyles.scroll}
      contentContainerStyle={[cardStyles.content, { paddingBottom: Spacing.four }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Photo ── */}
      <View style={styles.photoCard}>
        {photoUri
          ? <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          : <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={48} color={Colors.onSurfaceVariant} />
            </View>
        }
        <Pressable style={styles.retakeBtn} onPress={onRetake} disabled={analyzing}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={styles.retakeBtnLabel}>Retake</Text>
        </Pressable>
      </View>

      {/* ── Note ── */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>
          Add a note{'  '}
          <Text style={cardStyles.cardSub}>optional</Text>
        </Text>
        <TextInput
          style={styles.descInput}
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
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Meal Type</Text>
        <MealTypePills value={mealType} onChange={setMealType} disabled={analyzing} />
      </View>

      {/* ── CTA ── */}
      <Pressable
        style={[cardStyles.ctaBtn, (!mealType || analyzing) && cardStyles.ctaBtnBusy]}
        onPress={handleSubmit}
        disabled={!mealType || analyzing}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {analyzing
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="sparkles" size={18} color={Colors.onPrimary} />
        }
        <Text style={cardStyles.ctaLabel}>
          {analyzing ? 'Analysing…' : 'Analyse Meal'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    height: 200,
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
});
