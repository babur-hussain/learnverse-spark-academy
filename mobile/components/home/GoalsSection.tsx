import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import SectionHeader from './SectionHeader';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

interface Goal {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  icon?: string;
}

const GOAL_GRADIENTS: any[] = [
  ['#3b82f6', '#2563eb'],
  ['#10b981', '#059669'],
  ['#8b5cf6', '#7c3aed'],
  ['#f97316', '#ea580c'],
  ['#ec4899', '#db2777'],
  ['#06b6d4', '#0891b2'],
];

const GOAL_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'trophy',
  'rocket',
  'school',
  'briefcase',
  'bulb',
  'medal',
];

const GoalsSection: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setError(null);
        const res = await api.get('/admin/goals', { 
          params: { active: true },
          signal: controller.signal
        });
        setGoals(res.data?.data || res.data || []);
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.error('Error fetching goals:', e);
          setError('Failed to load goals.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Learning Goals" subtitle="Set your targets" />
        <FlatList
          horizontal
          data={[1, 2, 3]}
          keyExtractor={i => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={() => <Shimmer width={150} height={140} borderRadius={16} style={{ marginRight: 12 }} />}
        />
      </View>
    );
  }

  if (error && goals.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Learning Goals" subtitle="Set your targets" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (goals.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Learning Goals" subtitle="Set your targets" />
      <FlatList
        horizontal
        data={goals}
        keyExtractor={item => item._id || item.id || Math.random().toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const colors = GOAL_GRADIENTS[index % GOAL_GRADIENTS.length];
          const icon = GOAL_ICONS[index % GOAL_ICONS.length];
          return (
            <TouchableOpacity style={[styles.card, Shadow.sm]} activeOpacity={0.85}>
              <LinearGradient
                colors={colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={icon} size={28} color="#fff" />
                </View>
                <Text style={styles.goalTitle} numberOfLines={2}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.goalDesc} numberOfLines={2}>{item.description}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  errorContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    backgroundColor: `${Palette.danger}15`,
    marginHorizontal: Spacing.xl,
    borderRadius: 8,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  errorText: {
    color: Palette.danger,
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
    width: 155,
  },
  cardGradient: {
    padding: Spacing.lg,
    height: 160,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalTitle: {
    ...Typography.bodyBold,
    color: '#fff',
    fontSize: 15,
  },
  goalDesc: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
});

export default GoalsSection;
