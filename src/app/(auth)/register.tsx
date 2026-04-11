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
  View,
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
import { signUp } from '@/services/auth';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!displayName.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace('/(onboarding)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
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
            <Text style={styles.tagline}>Your editorial food diary</Text>
          </View>

          {/* ── Form Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create account</Text>

            <View style={styles.fields}>
              <Field
                label="Your name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Ahmed"
                autoCapitalize="words"
              />
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                secureTextEntry={!showPassword}
                rightIcon={
                  <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.onSurfaceVariant}
                    />
                  </Pressable>
                }
              />
              <Field
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                secureTextEntry={!showPassword}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.cta, loading && styles.ctaDisabled]}
              onPress={handleRegister}
              disabled={loading}
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            >
              {loading
                ? <ActivityIndicator color={Colors.onPrimary} />
                : <Text style={styles.ctaLabel}>Create Account</Text>
              }
            </Pressable>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Log in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Field sub-component ─────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  rightIcon?: React.ReactNode;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightIcon,
}: FieldProps) {
  return (
    <View style={fStyles.wrapper}>
      <Text style={fStyles.label}>{label}</Text>
      <View style={fStyles.inputRow}>
        <TextInput
          style={fStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.onSurfaceVariant}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {rightIcon}
      </View>
    </View>
  );
}

const fStyles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  label: {
    fontSize: FontSize.labelMd,
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
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
  input: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    fontFamily: FontFamily.body,
    color: Colors.onSurface,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────

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
