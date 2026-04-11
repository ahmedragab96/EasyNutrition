import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { MealType } from '@/types/nutrition';
import { MEAL_TYPE_OPTIONS } from './add-constants';
import { cameraSharedStyles, chipStyles, pillStyles } from './add-shared.styles';

// ─── MealTypePills ────────────────────────────────────────────────────────────

type MealTypePillsProps = {
  value: MealType | null;
  onChange: (t: MealType) => void;
  disabled?: boolean;
};

export function MealTypePills({ value, onChange, disabled }: MealTypePillsProps) {
  return (
    <View style={pillStyles.row}>
      {MEAL_TYPE_OPTIONS.map((opt) => {
        const active = value === opt.type;
        return (
          <Pressable
            key={opt.type}
            style={[pillStyles.pill, active && pillStyles.pillActive]}
            onPress={() => onChange(opt.type)}
            disabled={disabled}
          >
            <Text style={pillStyles.pillIcon}>{opt.icon}</Text>
            <Text style={[pillStyles.pillLabel, active && pillStyles.pillLabelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── MacroChip ────────────────────────────────────────────────────────────────

type MacroChipProps = { label: string; value: number; unit: string; highlight?: boolean };

export function MacroChip({ label, value, unit, highlight }: MacroChipProps) {
  return (
    <View style={[chipStyles.chip, highlight && chipStyles.chipHighlight]}>
      <Text style={[chipStyles.chipValue, highlight && chipStyles.chipValueHighlight]}>
        {value}{unit}
      </Text>
      <Text style={[chipStyles.chipLabel, highlight && chipStyles.chipLabelHighlight]}>
        {label}
      </Text>
    </View>
  );
}

// ─── CameraPermissionView ─────────────────────────────────────────────────────

type CameraPermissionViewProps = {
  icon: string;
  subtitle: string;
  onGrant: () => void;
};

export function CameraPermissionView({ icon, subtitle, onGrant }: CameraPermissionViewProps) {
  return (
    <View style={cameraSharedStyles.centered}>
      <Ionicons name={icon as any} size={52} color={Colors.onSurfaceVariant} />
      <Text style={cameraSharedStyles.permTitle}>Camera access needed</Text>
      <Text style={cameraSharedStyles.permSub}>{subtitle}</Text>
      <Pressable style={cameraSharedStyles.permBtn} onPress={onGrant}>
        <Text style={cameraSharedStyles.permBtnLabel}>Grant Access</Text>
      </Pressable>
    </View>
  );
}

// ─── CameraErrorView ──────────────────────────────────────────────────────────

type CameraErrorViewProps = {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  iconColor?: string;
};

export function CameraErrorView({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  iconColor,
}: CameraErrorViewProps) {
  return (
    <View style={cameraSharedStyles.centered}>
      <View style={cameraSharedStyles.errorCard}>
        <Ionicons name={icon as any} size={40} color={iconColor ?? Colors.onSurfaceVariant} />
        <Text style={cameraSharedStyles.errorTitle}>{title}</Text>
        <Text style={cameraSharedStyles.errorSub}>{subtitle}</Text>
        <Pressable style={cameraSharedStyles.permBtn} onPress={onAction}>
          <Text style={cameraSharedStyles.permBtnLabel}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
