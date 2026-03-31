/**
 * CustomTabBar — Android-only bottom navigation
 *
 * Design rules (DESIGN.md):
 *  - Glass: surface at 85% opacity background
 *  - No 1px borders — ghost border via outlineVariant at 15% only
 *  - Signature primary color for ADD FAB + active indicators
 *  - Micro-animations: spring scale on press (0.9x)
 *  - Ambient shadow: onSurface at 4% / 32px blur
 */

import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Spacing,
} from '@/constants/theme';

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  isAdd?: boolean;
};

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'index',
    label: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    name: 'calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
    iconActive: 'calendar',
  },
  {
    name: 'add',
    label: 'ADD',
    icon: 'add',
    iconActive: 'add',
    isAdd: true,
  },
  {
    name: 'insights',
    label: 'Insights',
    icon: 'bar-chart-outline',
    iconActive: 'bar-chart',
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

// ─── Animated Tab Item ────────────────────────────────────────────────────────

type TabItemProps = {
  config: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function TabItem({ config, isFocused, onPress, onLongPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.88, { damping: 14, stiffness: 380 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 380 });
  }, [scale]);

  // ── ADD (FAB) button ──────────────────────────────────────────────────────
  if (config.isAdd) {
    return (
      <Animated.View style={[styles.addWrapper, animStyle]}>
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel="Add meal"
          style={styles.addButton}
          android_ripple={{ color: Colors.primaryContainer, radius: 30, borderless: true }}
        >
          <Ionicons name="add" size={32} color={Colors.onPrimary} />
        </Pressable>
      </Animated.View>
    );
  }

  // ── Regular tab ───────────────────────────────────────────────────────────
  const iconColor = isFocused ? Colors.primary : Colors.onSurfaceVariant;
  const iconName = isFocused ? config.iconActive : config.icon;

  return (
    <Animated.View style={[styles.tabItem, animStyle]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={config.label}
        style={styles.tabPressable}
        android_ripple={{ color: Colors.surfaceContainerHigh, radius: 36, borderless: true }}
      >
        {/* Active indicator pill */}
        {isFocused && <View style={styles.activeIndicator} />}

        <Ionicons name={iconName} size={22} color={iconColor} />

        <Text
          style={[
            styles.tabLabel,
            { color: iconColor },
            isFocused && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

export default function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.three },
      ]}
    >
      <View style={styles.row}>
        {TAB_CONFIG.map((config) => {
          const routeIndex = state.routes.findIndex((r) => r.name === config.name);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            const route = state.routes[routeIndex];
            if (!route) return;
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            const route = state.routes[routeIndex];
            if (!route) return;
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={config.name}
              config={config}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopColor: `${Colors.outlineVariant}26`,
    // Ambient float shadow (onSurface 4% / 32px)
    elevation: 12,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    height: 70
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',

  },

  // ── Regular tab ────────────────────────────────────────────────────────────
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

  // ── ADD FAB ────────────────────────────────────────────────────────────────
  addWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Elevate the FAB above the bar surface
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
