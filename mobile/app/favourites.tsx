import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FavouritesScreen() {
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
          <Text style={styles.title}>Favourites</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty state */}
        <View style={[styles.emptyCard, Shadow.sm]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={56} color={Palette.danger} />
          </View>
          <Text style={styles.emptyTitle}>No Favourites Yet</Text>
          <Text style={styles.emptyDesc}>
            Courses and subjects you save will appear here for quick access.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/courses' as any)}
          >
            <LinearGradient
              colors={Palette.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreBtn}
            >
              <Ionicons name="compass" size={18} color="#fff" />
              <Text style={styles.exploreBtnText}>Explore Courses</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tip Card */}
        <View style={[styles.tipCard, Shadow.sm]}>
          <Ionicons name="bulb" size={24} color={Palette.warning} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Quick Tip</Text>
            <Text style={styles.tipDesc}>
              Tap the heart icon on any course or subject to save it to your favourites.
            </Text>
          </View>
        </View>
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
    paddingBottom: 16,
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
  scrollContent: {
    padding: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing['4xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Palette.danger}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  exploreBtnText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 15,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  tipDesc: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
