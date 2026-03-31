/**
 * ThemedView — updated for flat Colors design system.
 */

import { View, type ViewProps } from 'react-native';

import { ColorToken, Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  colorToken?: ColorToken;
};

export function ThemedView({ style, colorToken, ...otherProps }: ThemedViewProps) {
  return (
    <View
      style={[{ backgroundColor: Colors[colorToken ?? 'surface'] }, style]}
      {...otherProps}
    />
  );
}
