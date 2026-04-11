import { StyleSheet } from 'react-native';

import {
  Colors,
  Elevation,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';

export const TUBE_W = 52;
export const TUBE_H = 170;
export const WAVE_H = 16;
export const TILE_W = TUBE_W;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    ...Elevation.card,
  },
  label: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  tube: {
    width: TUBE_W,
    height: TUBE_H,
    borderRadius: TUBE_W / 2,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.secondary,
  },
  waveContainer: {
    position: 'absolute',
    left: 0,
    width: TUBE_W,
    overflow: 'hidden',
    height: WAVE_H * 2,
  },
  amount: {
    fontSize: FontSize.bodySm,
    fontFamily: FontFamily.displayBold,
    color: Colors.secondary,
    lineHeight: LineHeight.bodySm,
  },
  goal: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.labelSm,
  },
});
