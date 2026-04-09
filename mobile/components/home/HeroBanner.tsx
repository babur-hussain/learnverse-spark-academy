import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette, BorderRadius, Typography, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HeroBanner: React.FC = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Pulse animation for the AI badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#1e293b', '#0f172a', '#1e1b4b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* AI Badge */}
        <Animated.View style={[styles.aiBadge, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={Palette.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBadgeGradient}
          >
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={styles.aiBadgeText}>AI-Powered Learning</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>
          Learn Without{'\n'}
          <Text style={styles.titleGradient}>Limits</Text>
        </Text>

        <Text style={styles.subtitle}>
          Discover courses, live classes, and personalized learning paths designed for your success.
        </Text>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={() => router.push('/catalog' as any)} activeOpacity={0.8}>
          <Ionicons name="search" size={20} color={Palette.textMuted} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search courses, subjects...</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '10K+', label: 'Students' },
            { value: '500+', label: 'Courses' },
            { value: '50+', label: 'Educators' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: Palette.primary,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: Palette.purple,
    bottom: -30,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: Palette.pink,
    top: 60,
    left: SCREEN_WIDTH * 0.6,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  aiBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  aiBadgeText: {
    ...Typography.small,
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.textPrimary,
    marginBottom: Spacing.md,
  },
  titleGradient: {
    color: Palette.primary,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    marginBottom: Spacing['2xl'],
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    ...Typography.body,
    color: Palette.textMuted,
    paddingVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Palette.primary,
  },
  statLabel: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 2,
  },
});

export default HeroBanner;
