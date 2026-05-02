import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette, BorderRadius, Typography, Spacing, Shadow } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LibraryCard: React.FC = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Library</Text>
        <TouchableOpacity onPress={() => router.push('/catalog' as any)}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.card, Shadow.md]}
          onPress={() => router.push('/catalog' as any)}
        >
          {/* Decorative elements */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          {/* Content */}
          <View style={styles.contentWrapper}>
            {/* Icon stack */}
            <View style={styles.iconStack}>
              <View style={[styles.bookIcon, { backgroundColor: '#FFE082' }]}>
                <Ionicons name="book" size={28} color="#F9A825" />
              </View>
              <View style={[styles.bookIcon, { backgroundColor: '#90CAF9', marginTop: -8, marginLeft: 16 }]}>
                <Ionicons name="school" size={28} color="#1976D2" />
              </View>
              <View style={[styles.bookIcon, { backgroundColor: '#A5D6A7', marginTop: -8, marginLeft: 8 }]}>
                <Ionicons name="ribbon" size={24} color="#388E3C" />
              </View>
            </View>

            <Text style={styles.cardTitle}>
              See <Text style={styles.cardTitleAccent}>Padhaai Wala{'\n'}Solutions</Text> In Action
            </Text>
          </View>

          {/* Arrow button */}
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => router.push('/ai' as any)}
          >
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Palette.textPrimary,
  },
  seeAll: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  card: {
    backgroundColor: '#F5F0E0',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    minHeight: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 224, 130, 0.3)',
    top: -30,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(165, 214, 167, 0.3)',
    bottom: -20,
    left: -20,
  },
  contentWrapper: {
    flex: 1,
  },
  iconStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  bookIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  cardTitle: {
    ...Typography.h2,
    color: Palette.textPrimary,
    lineHeight: 28,
  },
  cardTitleAccent: {
    color: Palette.primary,
    fontWeight: '800',
  },
  arrowBtn: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow('#FF6B35'),
  },
});

export default LibraryCard;
