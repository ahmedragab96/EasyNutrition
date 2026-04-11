import React, { useEffect, useRef } from 'react';
import { PanResponder, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { styles, TILE_W, TUBE_H, WAVE_H } from './water-tube.styles';

const MAX_ML = 2000;
const SNAP_STEP = 250;

// Builds a tiling wave path (3 tiles wide for seamless horizontal scroll)
function buildWavePath(): string {
  const totalW = TILE_W * 3;
  const h = WAVE_H;
  let d = `M0,${h / 2}`;
  for (let i = 0; i < 3; i++) {
    const x = i * TILE_W;
    d += ` C${x + TILE_W * 0.3},0 ${x + TILE_W * 0.7},${h} ${x + TILE_W},${h / 2}`;
  }
  // Extend downward to cover the fill below the wave top
  d += ` L${totalW},${h * 2} L0,${h * 2} Z`;
  return d;
}

const WAVE_PATH = buildWavePath();

// ─── Types ────────────────────────────────────────────────────────────────────

type WaterTubeProps = {
  waterMl: number;
  onWaterChange: (ml: number) => void;
};

// ─── WaterTube ────────────────────────────────────────────────────────────────

export function WaterTube({ waterMl, onWaterChange }: WaterTubeProps) {
  const level = useSharedValue(waterMl / MAX_ML);
  const waveScroll = useSharedValue(0);
  const startLevelRef = useRef(0);

  // Sync incoming prop changes
  useEffect(() => {
    level.value = withSpring(waterMl / MAX_ML, { damping: 18, stiffness: 120 });
  }, [waterMl]);

  // Infinite horizontal wave scroll
  useEffect(() => {
    waveScroll.value = withRepeat(
      withTiming(-TILE_W, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startLevelRef.current = level.value;
      },
      onPanResponderMove: (_, gs) => {
        const newLevel = Math.max(0, Math.min(1, startLevelRef.current - gs.dy / TUBE_H));
        level.value = newLevel;
      },
      onPanResponderRelease: () => {
        const rawMl = level.value * MAX_ML;
        const snapped = Math.round(rawMl / SNAP_STEP) * SNAP_STEP;
        level.value = withSpring(snapped / MAX_ML, { damping: 18, stiffness: 150 });
        runOnJS(onWaterChange)(snapped);
      },
    }),
  ).current;

  // Fill rises from the bottom
  const fillStyle = useAnimatedStyle(() => ({
    height: Math.max(0, level.value * TUBE_H),
  }));

  // Wave sits at the top edge of the water fill
  const waveContainerStyle = useAnimatedStyle(() => ({
    top: Math.max(-WAVE_H, (1 - level.value) * TUBE_H - WAVE_H),
  }));

  const waveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveScroll.value }],
  }));

  const displayText =
    waterMl >= 1000
      ? `${(waterMl / 1000).toFixed(1)}L`
      : `${waterMl}ml`;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>WATER</Text>

      <View style={styles.tube} {...panResponder.panHandlers}>
        {/* Rising fill */}
        <Animated.View style={[styles.fill, fillStyle]} />

        {/* Animated wave surface */}
        {waterMl > 0 && (
          <Animated.View style={[styles.waveContainer, waveContainerStyle]} pointerEvents="none">
            <Animated.View style={waveAnimStyle}>
              <Svg width={TILE_W * 3} height={WAVE_H * 2}>
                <Path d={WAVE_PATH} fill={Colors.secondary} />
              </Svg>
            </Animated.View>
          </Animated.View>
        )}
      </View>

      <Text style={styles.amount}>{displayText}</Text>
    </View>
  );
}
