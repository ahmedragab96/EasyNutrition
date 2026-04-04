import { StyleSheet } from 'react-native';
import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Spacing,
} from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopColor: `${Colors.outlineVariant}26`,
    elevation: 12,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    height: 70,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
  },
  tabPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.half,
    borderRadius: Radius.md,
    minHeight: 54,
    overflow: 'hidden',
  },
  tabLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodyMedium,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
  },
  activeIndicator: {
    position: 'absolute',
    top: 5,
    width: 28,
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  addWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.six,
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    overflow: 'hidden',
  },
});
