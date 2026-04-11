import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Colors,
  Elevation,
  FontFamily,
  FontSize,
  LineHeight,
  Radius,
  Spacing,
} from '@/constants/theme';
import { signIn } from '@/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand ── */}
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={28} color={Colors.onPrimary} />
            </View>
            <Text style={styles.appName}>EasyNutrition</Text>
            <Text style={styles.tagline}>Welcome back</Text>
          </View>

          {/* ── Form Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log in</Text>

            <View style={styles.fields}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.onSurfaceVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.cta, loading && styles.ctaDisabled]}
              onPress={handleLogin}
              disabled={loading}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {loading
                ? <ActivityIndicator color={Colors.onPrimary} />
                : <Text style={styles.ctaLabel}>Log In</Text>
              }
            </Pressable>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Register</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.eight,
    paddingBottom: Spacing.six,
    gap: Spacing.six,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: FontSize.headlineSm,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.headlineSm,
    width: '100%',
    textAlign: 'center',
  },
  tagline: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xxl,
    padding: Spacing.six,
    gap: Spacing.five,
    ...Elevation.card,
  },
  cardTitle: {
    fontSize: FontSize.titleLg,
    fontFamily: FontFamily.displayBold,
    color: Colors.onSurface,
    lineHeight: LineHeight.titleLg,
  },
  fields: { gap: Spacing.four },
  fieldWrapper: { gap: Spacing.one },
  fieldLabel: {
    fontSize: FontSize.labelMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 52,
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    height: 52,
    gap: Spacing.two,
  },
  inputFlex: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },
  errorText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.error,
    textAlign: 'center',
  },
  cta: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaLabel: {
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.displaySemiBold,
    color: Colors.onPrimary,
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  footerLink: {
    fontSize: FontSize.bodyMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});
