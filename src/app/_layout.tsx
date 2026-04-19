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
        setHasProfile(!!profile && (profile.calorieGoal ?? 0) > 0);
      })
      .catch(() => {
        setHasProfile(false);
      })
      .finally(() => {
        setProfileReady(true);
      });
  }, [session, authLoading]);

  const appReady = (fontsLoaded || !!fontError) && !authLoading && profileReady;

  // Navigate to the correct screen, then hide the splash one frame later so
  // the target route has already rendered before the splash fades out.
  useEffect(() => {
    if (!appReady) return;

    if (!session) {
      router.replace('/(auth)/register');
    } else if (!hasProfile) {
      router.replace('/(onboarding)');
    } else {
      router.replace('/(tabs)');
    }

    const raf = requestAnimationFrame(() => { SplashScreen.hideAsync(); });
    return () => cancelAnimationFrame(raf);
  }, [appReady, session, hasProfile]);

  // Keep returning null (native splash stays visible) until everything is
  // resolved. The Stack only mounts once we know where to send the user.
  if (!appReady) return null;

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
