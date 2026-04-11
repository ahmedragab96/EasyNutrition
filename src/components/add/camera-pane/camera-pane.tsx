import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useMealAnalysis } from '@/hooks/use-meal-analysis';
import { type MealAnalysisResult } from '@/services/meal-analysis';
import { MealType } from '@/types/nutrition';
import { CameraErrorView, CameraPermissionView } from '../add-shared/add-shared';
import { AiResultCard } from './ai-result-card';
import { PreviewPane } from './preview-pane';

type CameraState = 'viewfinder' | 'preview' | 'result' | 'error';

export function CameraPane() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraState, setCameraState] = useState<CameraState>('viewfinder');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<MealAnalysisResult | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { analyze } = useMealAnalysis();

  function handleReset() {
    setCameraState('viewfinder');
    setPhotoUri(null);
    setPhotoBase64(null);
    setAiResult(null);
  }

  async function handleCapture() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8, base64: true });
      if (!photo?.uri || !photo?.base64) return;
      setPhotoUri(photo.uri);
      setPhotoBase64(photo.base64);
      setCameraState('preview');
    } catch {
      setCameraState('error');
    }
  }

  async function handleAnalyse(description: string, type: MealType) {
    try {
      const result = await analyze({
        imageBase64: photoBase64!,
        mimeType: 'image/jpeg',
        description: description.trim() || undefined,
      });
      setAiResult(result);
      setCameraState('result');
    } catch {
      setCameraState('error');
    }
  }

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <CameraPermissionView
        icon="camera-outline"
        subtitle="Allow camera access so EasyNutrition can analyse your meal."
        onGrant={requestPermission}
      />
    );
  }

  if (cameraState === 'error') {
    return (
      <CameraErrorView
        icon="alert-circle-outline"
        title="Analysis failed"
        subtitle="Could not identify the meal. Please try again."
        actionLabel="Try Again"
        onAction={handleReset}
        iconColor={Colors.tertiary}
      />
    );
  }

  if (cameraState === 'preview') {
    return <PreviewPane photoUri={photoUri} onRetake={handleReset} onAnalyse={handleAnalyse} />;
  }

  if (cameraState === 'result' && aiResult) {
    return (
      <AiResultCard
        photoUri={photoUri}
        result={aiResult}
        onRetake={handleReset}
        onConfirm={handleReset}
      />
    );
  }

  // Viewfinder
  return (
    <View style={styles.viewfinder}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.guideTopLeft} />
        <View style={styles.guideTopRight} />
        <View style={styles.guideBottomLeft} />
        <View style={styles.guideBottomRight} />
        <View style={styles.hint}>
          <Text style={styles.hintText}>Point at your meal</Text>
        </View>
      </CameraView>
      <View style={styles.captureRow}>
        <Pressable
          onPress={handleCapture}
          style={styles.captureBtn}
          accessibilityLabel="Take photo"
          android_ripple={{ color: Colors.primaryContainer, borderless: true, radius: 36 }}
        >
          <View style={styles.captureInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { flex: 1 },
  camera: { flex: 1, borderRadius: Radius.xxl, overflow: 'hidden' },
  hint: {
    position: 'absolute',
    top: Spacing.five,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
  },
  hintText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: '#ffffff',
  },
  guideTopLeft:     { position: 'absolute', top: 24,    left: 24,    width: 22, height: 22, borderTopWidth: 2.5,    borderLeftWidth: 2.5,   borderColor: '#ffffff', borderTopLeftRadius: 4     },
  guideTopRight:    { position: 'absolute', top: 24,    right: 24,   width: 22, height: 22, borderTopWidth: 2.5,    borderRightWidth: 2.5,  borderColor: '#ffffff', borderTopRightRadius: 4    },
  guideBottomLeft:  { position: 'absolute', bottom: 24, left: 24,    width: 22, height: 22, borderBottomWidth: 2.5, borderLeftWidth: 2.5,   borderColor: '#ffffff', borderBottomLeftRadius: 4  },
  guideBottomRight: { position: 'absolute', bottom: 24, right: 24,   width: 22, height: 22, borderBottomWidth: 2.5, borderRightWidth: 2.5,  borderColor: '#ffffff', borderBottomRightRadius: 4 },
  captureRow: { height: 100, alignItems: 'center', justifyContent: 'center' },
  captureBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
  },
});
