/**
 * Navbar — Home screen top bar.
 *
 * Composes AppBar + UserAvatar with the EasyNutrition brand block.
 * Optionally shows a greeting and today's date below the brand name.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Spacing,
} from '@/constants/theme';
import { AppBar } from './app-bar';
import { UserAvatar, type UserAvatarProps } from './user-avatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavbarProps = {
  /** Greeting line, e.g. "Good morning 👋" */
  greeting?: string;
  /** Date line, e.g. "Tuesday, March 31" */
  date?: string;
  /** Props forwarded to UserAvatar */
  avatar?: UserAvatarProps;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrandBlock({ greeting, date }: Pick<NavbarProps, 'greeting' | 'date'>) {
  return (
    <View style={styles.brandBlock}>
      <Text style={styles.brandName} numberOfLines={1}>
        EasyNutrition
      </Text>
      {greeting ? (
        <Text style={styles.greeting} numberOfLines={1}>
          {greeting}
        </Text>
      ) : null}
      {date ? (
        <Text style={styles.date} numberOfLines={1}>
          {date}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar({ greeting, date, avatar }: NavbarProps) {
  return (
    <AppBar
      style={greeting || date ? styles.tall : undefined}
      leftSlot={<BrandBlock greeting={greeting} date={date} />}
      rightSlot={<UserAvatar size={44} {...avatar} />}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /** Taller bar when greeting/date lines are present */
  tall: {
    height: 'auto' as unknown as number,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },

  brandBlock: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: FontSize.titleMd,
    fontFamily: FontFamily.displayBold,
    color: Colors.primary,
    lineHeight: LineHeight.titleMd,
    letterSpacing: -0.3,
  },
  greeting: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
    marginTop: Spacing.three,
  },
  date: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
});
