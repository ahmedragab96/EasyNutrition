import { StyleSheet } from 'react-native';
import { Colors, FontFamily } from '@/constants/theme';

export const styles = StyleSheet.create({
  circle: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  initials: {
    fontFamily: FontFamily.displayBold,
    color: Colors.onPrimary,
    includeFontPadding: false,
  },
});
