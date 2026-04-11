import { StyleSheet } from 'react-native';

import { FontFamily, FontSize } from '@/constants/theme';

export const styles = StyleSheet.create({
  scoreNumber: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayExtraBold,
    lineHeight: FontSize.headlineSm,
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    color: '#717968',
    letterSpacing: 1,
    marginTop: 2,
  },
});
