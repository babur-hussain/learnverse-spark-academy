import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SHORTCUTS = [
  { id: 'career', title: 'Career Path', icon: 'compass', route: '/career-guidance', colors: ['#4F46E5', '#3B82F6'] },
  { id: 'forum', title: 'Discussion', icon: 'chatbubbles', route: '/forum', colors: ['#9333EA', '#A855F7'] },
  { id: 'videos', title: 'Video Library', icon: 'play-circle', route: '/video-library', colors: ['#E11D48', '#F43F5E'] },
  { id: 'shop', title: 'Stationery', icon: 'cart', route: '/stationery', colors: ['#0284C7', '#0EA5E9'] },
  { id: 'achievements', title: 'Trophies', icon: 'trophy', route: '/achievements', colors: ['#D97706', '#F59E0B'] },
  { id: 'analytics', title: 'Analytics', icon: 'stats-chart', route: '/analytics', colors: ['#059669', '#10B981'] },
];

export default function FeatureShortcuts() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Explore Features</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width * 0.32 + Spacing.md}
        decelerationRate="fast"
      >
        {SHORTCUTS.map(item => (
          <TouchableOpacity 
            key={item.id} 
            activeOpacity={0.8}
            onPress={() => router.push(item.route as any)}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={item.colors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, Shadow.md]}
            >
              <View style={styles.iconRing}>
                <Ionicons name={item.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  cardWrapper: {
    width: width * 0.32,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    height: 110,
    justifyContent: 'space-between',
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
    marginTop: 8,
  }
});
