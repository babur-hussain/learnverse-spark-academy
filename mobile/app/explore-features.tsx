import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const EXPLORE_SECTIONS = [
  {
    id: 'career',
    title: 'Career Guidance',
    description: 'Get expert advice on career paths and opportunities',
    icon: 'briefcase' as const,
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
  },
  {
    id: 'school',
    title: 'Find Your School',
    description: 'Discover schools and colleges near you',
    icon: 'school' as const,
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
  },
  {
    id: 'forum',
    title: 'Discussion Forum',
    description: 'Join conversations with fellow students',
    icon: 'chatbubbles' as const,
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
  },
  {
    id: 'peer',
    title: 'Peer Learning',
    description: 'Learn together with study groups',
    icon: 'people' as const,
    color: '#f97316',
    gradient: ['#f97316', '#ea580c'],
  },
  {
    id: 'videos',
    title: 'Video Library',
    description: 'Watch educational videos and tutorials',
    icon: 'play-circle' as const,
    color: '#ec4899',
    gradient: ['#ec4899', '#db2777'],
  },
  {
    id: 'stationery',
    title: 'Stationery Shop',
    description: 'Buy books, supplies, and more',
    icon: 'cart' as const,
    color: '#06b6d4',
    gradient: ['#06b6d4', '#0891b2'],
  },
];

const ROUTE_MAP: Record<string, string> = {
  career: '/career-guidance',
  school: '/find-school',
  forum: '/forum',
  peer: '/forum',
  videos: '/video-library',
  stationery: '/stationery',
};

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1e293b', '#0f172a'] as any}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Explore</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>Discover more features</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {EXPLORE_SECTIONS.map(section => (
          <TouchableOpacity
            key={section.id}
            style={[styles.featureCard, Shadow.md]}
            activeOpacity={0.85}
            onPress={() => router.push(ROUTE_MAP[section.id] as any)}
          >
            <LinearGradient
              colors={section.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.featureCardGradient}
            >
              <View style={styles.featureIconContainer}>
                <Ionicons name={section.icon} size={28} color="#fff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{section.title}</Text>
                <Text style={styles.featureDesc}>{section.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Quick Links */}
        <Text style={styles.sectionLabel}>Quick Links</Text>
        <View style={[styles.quickLinksCard, Shadow.sm]}>
          {[
            { icon: 'newspaper' as const, label: 'Latest News', color: Palette.primary },
            { icon: 'trophy' as const, label: 'Achievements', color: Palette.warning },
            { icon: 'stats-chart' as const, label: 'Learning Analytics', color: Palette.success },
            { icon: 'gift' as const, label: 'Refer & Earn', color: Palette.purple },
          ].map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.quickLinkRow}>
                <View style={[styles.quickLinkIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.quickLinkLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
              </TouchableOpacity>
              {index < 3 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bgCardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  featureCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  featureCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  featureDesc: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  quickLinksCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  quickLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quickLinkLabel: {
    ...Typography.body,
    color: Palette.textPrimary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginLeft: 64,
  },
});
