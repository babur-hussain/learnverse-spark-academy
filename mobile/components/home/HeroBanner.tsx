import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette, BorderRadius, Typography, Spacing, Shadow } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HeroBanner: React.FC = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/catalog', params: { q: searchQuery.trim() } } as any);
    } else {
      router.push('/catalog' as any);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* AI Badge */}
        <Animated.View style={[styles.aiBadge, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.aiBadgeInner}>
            <Ionicons name="sparkles" size={14} color={Palette.primary} />
            <Text style={styles.aiBadgeText}>AI-Powered Learning</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>
          Learn Without{'\n'}
          <Text style={styles.titleAccent}>Limits</Text>
        </Text>

        <Text style={styles.subtitle}>
          Discover courses, live classes, and personalized learning paths designed for your success.
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, Shadow.sm]}>
          <Ionicons name="search" size={20} color={Palette.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchPlaceholder}
            placeholder="Search courses, subjects..."
            placeholderTextColor={Palette.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { value: '10K+', label: 'Students' },
            { value: '500+', label: 'Courses' },
            { value: '50+', label: 'Educators' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statItem, Shadow.sm]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.bgCream,
    paddingTop: 20,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
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
    backgroundColor: Palette.warning,
    bottom: -30,
    left: -30,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  aiBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 6,
    backgroundColor: '#FFF0E5',
  },
  aiBadgeText: {
    ...Typography.small,
    color: Palette.primary,
    fontWeight: '700',
  },
  title: {
    ...Typography.hero,
    color: Palette.textPrimary,
    marginBottom: Spacing.md,
  },
  titleAccent: {
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
    color: Palette.textPrimary,
    paddingVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
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
