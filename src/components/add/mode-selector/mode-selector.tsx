import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Mode } from '../add-shared/add-constants';

const MODE_CONFIG: { mode: Mode; icon: string; label: string }[] = [
  { mode: 'camera',  icon: 'camera',  label: 'Camera'  },
  { mode: 'barcode', icon: 'barcode', label: 'Barcode' },
  { mode: 'manual',  icon: 'search',  label: 'Manual'  },
];

type ModeSelectorProps = {
  value: Mode;
  onChange: (m: Mode) => void;
};

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <View style={styles.track}>
      {MODE_CONFIG.map(({ mode, icon, label }) => {
        const active = value === mode;
        return (
          <Pressable
            key={mode}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(mode)}
          >
            <Ionicons
              name={icon as any}
              size={16}
              color={active ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
