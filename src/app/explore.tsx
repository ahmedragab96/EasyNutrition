/**
 * Leftover route from the Expo template — hidden from the tab bar.
 * Kept to avoid expo-router orphan route warnings.
 */
import { Redirect } from 'expo-router';
import React from 'react';

export default function ExploreScreen() {
  return <Redirect href="/" />;
}
