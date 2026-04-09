import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const MyLearnings: React.FC = () => {
  // This would normally fetch user's enrolled courses
  // For now showing placeholder with nice design
  return (
    <View style={styles.container}>
      <SectionHeader title="My Learnings" subtitle="Continue where you left off" />
      <View style={styles.emptyCard}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.emptyCardGradient}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="school-outline" size={48} color={Palette.primary} />
          </View>
          <Text style={styles.emptyTitle}>Start Your Learning Journey</Text>
          <Text style={styles.emptyDesc}>
            Enroll in courses to track your progress and continue learning.
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={Palette.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.browseBtn}
            >
              <Ionicons name="compass" size={18} color="#fff" />
              <Text style={styles.browseBtnText}>Browse Courses</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  emptyCard: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  emptyCardGradient: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderStyle: 'dashed',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  browseBtnText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 15,
  },
});

export default MyLearnings;
