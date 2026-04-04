import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { styles } from './user-avatar.styles';

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
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
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
