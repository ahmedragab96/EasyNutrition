/**
 * UserAvatar — circular avatar with initials fallback.
 *
 * Used in the AppBar right slot and Profile screens.
 * Background: Colors.primary, text: Colors.onPrimary.
 * Ambient shadow per DESIGN.md: onSurface 4% / 32px blur.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
} from '@/constants/theme';

export type UserAvatarProps = {
  /** Up to 2 initials. If not provided, shows person icon. */
  initials?: string;
  /** Diameter in px. Defaults to 40. */
  size?: number;
  onPress?: () => void;
};

export function UserAvatar({ initials, size = 40, onPress }: UserAvatarProps) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const content = (
    <View style={[styles.circle, circleStyle]}>
      {initials ? (
        <Text
          style={[
            styles.initials,
            { fontSize: size * 0.35 },
          ]}
        >
          {initials.toUpperCase().slice(0, 2)}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={Colors.onPrimary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        android_ripple={{
          color: Colors.primaryContainer,
          radius: size / 2,
          borderless: true,
        }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Ambient shadow
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  initials: {
    fontFamily: FontFamily.displayBold,
    color: Colors.onPrimary,
    includeFontPadding: false,
  },
});
