import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { type ReactNode } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { styles } from './app-bar.styles';

export type AppBarProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  style?: ViewStyle;
};

export function AppBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftSlot,
  rightSlot,
  style,
}: AppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.root, style]}>
      <View style={styles.leftSection}>
        {leftSlot ? (
          leftSlot
        ) : (
          <>
            {showBack && (
              <Pressable
                onPress={handleBack}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                android_ripple={{
                  color: Colors.surfaceContainerHigh,
                  radius: 22,
                  borderless: true,
                }}
              >
                <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
              </Pressable>
            )}
            {title && (
              <View style={styles.titleBlock}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            )}
          </>
        )}
      </View>

      {rightSlot ? <View style={styles.rightSection}>{rightSlot}</View> : null}
    </View>
  );
}
