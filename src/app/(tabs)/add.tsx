import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarcodeScanPane } from '@/components/add/barcode-scan-pane';
import { CameraPane } from '@/components/add/camera-pane';
import { ManualPane } from '@/components/add/manual-pane';
import { ModeSelector } from '@/components/add/mode-selector';
import { type Mode } from '@/components/add/add-shared/add-constants';
import { Colors, FontFamily, FontSize, LineHeight, Spacing } from '@/constants/theme';

export default function AddScreen() {
  const [mode, setMode] = useState<Mode>('camera');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Log Meal</Text>
        <ModeSelector value={mode} onChange={setMode} />
      </View>

      <View style={styles.body}>
        {mode === 'camera'  && <CameraPane />}
        {mode === 'barcode' && <BarcodeScanPane />}
        {mode === 'manual'  && <ManualPane />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
    letterSpacing: -0.3,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.two,
  },
});
