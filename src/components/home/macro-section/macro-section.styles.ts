import { StyleSheet } from 'react-native';
import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.six,
    gap: Spacing.five,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleSm,
  },
  barRow: {
    gap: Spacing.two,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  macroLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
  },
  macroValues: {
    fontSize: FontSize.bodyMd,
    lineHeight: LineHeight.bodyMd,
  },
  macroConsumed: {
    fontFamily: FontFamily.bodySemiBold,
  },
  macroGoal: {
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
