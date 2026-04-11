import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, FontFamily, FontSize, LineHeight, Radius, Spacing } from '@/constants/theme';
import { useFoodSearch } from '@/hooks/use-food-search';
import { FoodItem } from '@/types/nutrition';
import { CATEGORY_ICON } from '../add-shared/add-constants';

// ─── ManualPane ───────────────────────────────────────────────────────────────

export function ManualPane() {
  const [query, setQuery] = useState('');
  const { results, loading, isShowingRecent } = useFoodSearch(query);

  return (
    <View style={styles.root}>
      {/* ── Search bar ── */}
      <View style={styles.topRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods you've logged…"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={styles.addItemBtn}
          onPress={() => router.push('/create-item')}
          android_ripple={{ color: Colors.primaryContainer, borderless: true, radius: 22 }}
          accessibilityLabel="Add new food item"
        >
          <Ionicons name="add" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {!loading && (
        <Text style={styles.sectionLabel}>
          {isShowingRecent
            ? results.length > 0 ? 'QUICK ADD' : ''
            : `${results.length} result${results.length !== 1 ? 's' : ''}`}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.six }} />
      ) : isShowingRecent && results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyText}>No meals logged yet</Text>
          <Text style={styles.emptySub}>Use the camera to scan and log your first meal</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No results for "{query}"</Text>
              <Text style={styles.emptySub}>Try the camera to scan and log a new meal</Text>
            </View>
          }
          renderItem={({ item }) => <FoodRow item={item} />}
        />
      )}
    </View>
  );
}

// ─── FoodRow ──────────────────────────────────────────────────────────────────

function FoodRow({ item }: { item: FoodItem }) {
  function handlePress() {
    router.push({
      pathname: '/log-item',
      params: {
        id: item.id,
        name: item.name,
        kcal: String(item.kcal),
        protein: String(item.macros.protein),
        carbs: String(item.macros.carbs),
        fats: String(item.macros.fats),
        servingSize: String(item.servingSize ?? 100),
        servingUnit: item.servingUnit ?? 'g',
        isCountable: item.isCountable ? '1' : '0',
        source: item.source,
        category: item.category ?? '',
      },
    });
  }

  return (
    <Pressable
      style={rowStyles.row}
      onPress={handlePress}
      android_ripple={{ color: Colors.surfaceContainerHigh }}
    >
      <View style={rowStyles.icon}>
        <Text style={rowStyles.iconEmoji}>
          {item.category ? (CATEGORY_ICON[item.category] ?? '🍽️') : '🍽️'}
        </Text>
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={rowStyles.meta}>
          {item.macros.protein}g P · {item.macros.carbs}g C · {item.macros.fats}g F
        </Text>
      </View>
      <View style={rowStyles.right}>
        <Text style={rowStyles.kcal}>{item.kcal}</Text>
        <Text style={rowStyles.kcalUnit}>kcal</Text>
      </View>
      <View style={rowStyles.arrow}>
        <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceVariant} />
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, gap: Spacing.three },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },
  addItemBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
  },
  list: { gap: Spacing.two, paddingBottom: Spacing.four },
  empty: { alignItems: 'center', paddingTop: Spacing.ten, gap: Spacing.two },
  emptyIcon: { fontSize: 36 },
  emptyText: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    lineHeight: LineHeight.bodyMd,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
  meta: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  right: { alignItems: 'flex-end' },
  kcal: {
    fontSize: FontSize.titleSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
  },
  kcalUnit: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
