import { StyleSheet } from 'react-native';
import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Spacing,
} from '@/constants/theme';

export const styles = StyleSheet.create({
  tall: {
    height: 'auto' as unknown as number,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  brandBlock: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.primary,
    lineHeight: LineHeight.titleMd,
    letterSpacing: -0.3,
  },
  greeting: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
    marginTop: Spacing.three,
  },
  date: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
});
