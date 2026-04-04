/**
 * AppBar — reusable top navigation bar.
 *
 * Design rules (DESIGN.md):
 *  - No bottom border/divider — depth is created by content below (no-line rule)
 *  - Background: Colors.background — blends with screen surface
 *  - Title: titleLg Plus Jakarta Sans SemiBold, onSurface
 *  - Subtitle: labelSm Manrope, onSurfaceVariant
 *  - Back/menu icon touch area: 44×44 min (accessibility)
 *
 * Usage:
 *   // Simple title screen
 *   <AppBar title="Calendar" showBack />
 *
 *   // Home (brand + avatar)
 *   <AppBar title="EasyNutrition" rightSlot={<UserAvatar />} />
 *
 *   // Custom left + right
 *   <AppBar leftSlot={<BrandBlock />} rightSlot={<UserAvatar />} />
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import {
  Colors,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppBarProps = {
  /** Main title text */
  title?: string;
  /** Smaller text below the title */
  subtitle?: string;
  /**
   * Show a back arrow on the left. If `onBack` is not provided,
   * defaults to `router.back()`.
   */
  showBack?: boolean;
  /** Custom back handler (if not provided, uses router.back()) */
  onBack?: () => void;
  /**
   * Replaces the back button + title block entirely.
   * Use for fully custom left content (e.g., the Home brand block).
   */
  leftSlot?: ReactNode;
  /** Optional content on the right (avatar, icon buttons, etc.) */
  rightSlot?: ReactNode;
  /** Additional styles for the root container */
  style?: ViewStyle;
};

// ─── AppBar ───────────────────────────────────────────────────────────────────

export function AppBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftSlot,
  rightSlot,
  style,
}: AppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.root, style]}>
      {/* ── Left ── */}
      <View style={styles.leftSection}>
        {leftSlot ? (
          leftSlot
        ) : (
          <>
            {showBack && (
              <Pressable
                onPress={handleBack}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                android_ripple={{
                  color: Colors.surfaceContainerHigh,
                  radius: 22,
                  borderless: true,
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Colors.onSurface}
                />
              </Pressable>
            )}
            {title && (
              <View style={styles.titleBlock}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            )}
          </>
        )}
      </View>

      {/* ── Right ── */}
      {rightSlot ? (
        <View style={styles.rightSection}>{rightSlot}</View>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.background,
    // No bottom border (DESIGN.md no-line rule)
    // Depth is created by the content / card below
  },

  // ── Left block ─────────────────────────────────────────────────────────────
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

  // ── Right block ────────────────────────────────────────────────────────────
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
