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
  root: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.background,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginRight: Spacing.three,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Spacing.two,
  },
  titleBlock: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleLg,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.labelSm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
