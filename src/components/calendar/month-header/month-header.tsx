import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';

export type MonthHeaderProps = {
  label: string;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onThisMonth: () => void;
};

export function MonthHeader({
  label,
  isCurrentMonth,
  onPrev,
  onNext,
  onThisMonth,
}: MonthHeaderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>THE LIVING LEDGER</Text>
      <Text style={styles.title}>{label}</Text>
      <View style={styles.navRow}>
        <Pressable
          onPress={onPrev}
          style={styles.arrowBtn}
          accessibilityLabel="Previous month"
          android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.onSurface} />
        </Pressable>

        <Pressable
          onPress={onThisMonth}
          style={[styles.chip, isCurrentMonth && styles.chipActive]}
          android_ripple={{ color: Colors.primaryContainer }}
        >
          <Text style={[styles.chipLabel, isCurrentMonth && styles.chipLabelActive]}>
            This Month
          </Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          style={styles.arrowBtn}
          accessibilityLabel="Next month"
          android_ripple={{ color: Colors.surfaceContainerHigh, borderless: true, radius: 20 }}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  eyebrow: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.4,
  },
  title: {
    fontSize: FontSize.headlineMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineMd,
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primaryContainer },
  chipLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
  },
  chipLabelActive: { color: Colors.onPrimaryContainer },
});
