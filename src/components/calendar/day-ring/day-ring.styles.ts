import { StyleSheet } from 'react-native';
import { FontFamily } from '@/constants/theme';

export const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.displaySemiBold,
    includeFontPadding: false,
  },
});
