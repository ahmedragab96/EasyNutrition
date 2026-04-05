/**
 * Root layout — font loading + Stack navigator + auth guard.
 * Redirects based on session state and onboarding completion.
 */

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/user-profile';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const { session, loading: authLoading } = useAuth();
  const [profileReady, setProfileReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Once we have a session, check if the user completed onboarding
  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      setProfileReady(true);
      return;
    }

    getUserProfile()
      .then((profile) => {
        // Only consider onboarding done if calorieGoal was explicitly set
        // (i.e. the user completed the onboarding wizard). A null profile or
        // a row with calorieGoal === 0 means onboarding is still needed.
        setHasProfile(!!profile && (profile.calorieGoal ?? 0) > 0);
      })
      .catch(() => {
        setHasProfile(false);
      })
      .finally(() => {
        setProfileReady(true);
      });
  }, [session, authLoading]);

  // Hide splash and redirect once everything is resolved
  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    if (authLoading || !profileReady) return;

    SplashScreen.hideAsync();

    if (!session) {
      router.replace('/(auth)/register');
    } else if (!hasProfile) {
      router.replace('/(onboarding)');
    } else {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, fontError, authLoading, session, hasProfile, profileReady]);

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
