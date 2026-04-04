import { StyleSheet } from 'react-native';
import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Spacing,
} from '@/constants/theme';

export const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleMd,
  },
  viewDiaryBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  viewDiaryLabel: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.secondary,
    lineHeight: LineHeight.bodyMd,
  },
  list: {
    gap: Spacing.six,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.ten,
    gap: Spacing.three,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
});
