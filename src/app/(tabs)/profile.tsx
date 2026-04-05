import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserAvatar } from '@/components/ui/user-avatar';
import {
  Colors,
  Elevation,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { signOut } from '@/services/auth';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function ProfileScreen() {
  const { profile, loading } = useUserProfile();

  const initials = profile?.displayName
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2) ?? undefined;

  async function handleLogOut() {
    await signOut();
    router.replace('/(auth)/register');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* ── Identity ── */}
            <View style={styles.identityCard}>
              <UserAvatar initials={initials} size={72} />
              <View style={styles.identityText}>
                <Text style={styles.displayName}>
                  {profile?.displayName ?? 'Your profile'}
                </Text>
              </View>
            </View>

            {/* ── Daily Goals ── */}
            <View style={styles.section}>
              <Text style={styles.sectionEyebrow}>DAILY GOALS</Text>
              <View style={styles.card}>
                <GoalRow
                  icon="flame-outline"
                  label="Calories"
                  value={`${profile?.calorieGoal ?? 0} kcal`}
                  color={Colors.tertiary}
                />
                <View style={styles.divider} />
                <GoalRow
                  icon="barbell-outline"
                  label="Protein"
                  value={`${profile?.macroGoals.protein ?? 0} g`}
                  color={Colors.secondary}
                />
                <View style={styles.divider} />
                <GoalRow
                  icon="leaf-outline"
                  label="Carbs"
                  value={`${profile?.macroGoals.carbs ?? 0} g`}
                  color={Colors.primary}
                />
                <View style={styles.divider} />
                <GoalRow
                  icon="water-outline"
                  label="Fats"
                  value={`${profile?.macroGoals.fats ?? 0} g`}
                  color="#c47800"
                />
              </View>
            </View>

            {/* ── Log Out ── */}
            <Pressable
              style={styles.logoutBtn}
              onPress={handleLogOut}
              android_ripple={{ color: Colors.errorContainer }}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutLabel}>Log Out</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── GoalRow ──────────────────────────────────────────────────────────────────

type GoalRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
};

function GoalRow({ icon, label, value, color }: GoalRowProps) {
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.iconBadge, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.onSurface,
  },
  value: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onSurface,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.ten,
    gap: Spacing.five,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },

  // Identity
  identityCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.six,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    ...Elevation.card,
  },
  identityText: {
    flex: 1,
    gap: Spacing.one,
  },
  displayName: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleLg,
  },

  // Section
  section: { gap: Spacing.two },
  sectionEyebrow: {
    fontSize: FontSize.labelSm,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
    paddingHorizontal: Spacing.one,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.five,
    ...Elevation.card,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
  },

  // Log out
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 52,
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  logoutLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.error,
  },
});
