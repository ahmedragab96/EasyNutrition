import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { styles } from './insights-empty-state.styles';

type InsightsEmptyStateProps = {
  monthLabel: string;
  loading: boolean;
  error: string | null;
  onAnalyse: () => void;
};

export function InsightsEmptyState({
  monthLabel,
  loading,
  error,
  onAnalyse,
}: InsightsEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="analytics-outline" size={40} color={Colors.primary} />
      </View>
      <Text style={styles.title}>No insights yet</Text>
      <Text style={styles.body}>
        Analyse your {monthLabel} nutrition data to get personalised feedback and recommendations.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={[styles.cta, loading && styles.ctaBusy]}
        onPress={onAnalyse}
        disabled={loading}
        android_ripple={{ color: Colors.primaryContainer }}
      >
        {loading
          ? <ActivityIndicator size="small" color={Colors.onPrimary} />
          : <Ionicons name="sparkles" size={18} color={Colors.onPrimary} />
        }
        <Text style={styles.ctaLabel}>
          {loading ? 'Analysing…' : `Analyse ${monthLabel}`}
        </Text>
      </Pressable>
    </View>
  );
}
