/**
 * ThemedText — updated for the flat Colors design system.
 * Kept for backward compatibility with any old components,
 * but new screens should use StyleSheet.create with Colors directly.
 */

import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, FontFamily, FontSize } from '@/constants/theme';

export type ThemedTextType =
  | 'default'
  | 'title'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
};

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        { color: Colors.onSurface },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: FontSize.bodyMd,
    lineHeight: 20,
    fontFamily: FontFamily.bodyMedium,
  },
  smallBold: {
    fontSize: FontSize.bodyMd,
    lineHeight: 20,
    fontFamily: FontFamily.bodyBold,
  },
  default: {
    fontSize: FontSize.bodyLg,
    lineHeight: 24,
    fontFamily: FontFamily.bodyMedium,
  },
  title: {
    fontSize: FontSize.displayMd,
    fontFamily: FontFamily.displayBold,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: FontSize.headlineLg,
    lineHeight: 40,
    fontFamily: FontFamily.displaySemiBold,
  },
  link: {
    lineHeight: 30,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: FontSize.bodyMd,
    color: Colors.secondary,
    fontFamily: FontFamily.bodyMedium,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: FontSize.bodySm,
  },
});
