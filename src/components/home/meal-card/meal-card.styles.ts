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
    borderRadius: Radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  accentBar: {
    width: 4,
    borderRadius: Radius.full,
    marginVertical: Spacing.three,
    marginLeft: Spacing.three,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  mealType: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    letterSpacing: 0.8,
  },
  mealName: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleSm,
  },
  kcal: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.bodyMd,
    paddingTop: Spacing.three,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroChip: {
    alignItems: 'center',
    gap: 1,
  },
  macroLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.onSurface,
  },
  descriptionRow: {
    paddingTop: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
    marginTop: Spacing.one,
  },
  descriptionLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.labelSm,
  },
});
