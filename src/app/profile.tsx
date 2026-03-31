import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.placeholder}>👤</Text>
        <Text style={styles.label}>Profile</Text>
        <Text style={styles.hint}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  placeholder: {
    fontSize: 64,
  },
  label: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  hint: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
});
