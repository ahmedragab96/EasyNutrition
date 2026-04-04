import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { styles } from './tab-bar.styles';

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  isAdd?: boolean;
};

const TAB_CONFIG: TabConfig[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'calendar', label: 'Calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'add', label: 'ADD', icon: 'add', iconActive: 'add', isAdd: true },
  { name: 'insights', label: 'Insights', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
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
        {isFocused && <View style={styles.activeIndicator} />}
        <Ionicons name={iconName} size={22} color={iconColor} />
        <Text
          style={[styles.tabLabel, { color: iconColor }, isFocused && styles.tabLabelActive]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── CustomTabBar ─────────────────────────────────────────────────────────────

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
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
