import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

// Home sections
import HeroBanner from '@/components/home/HeroBanner';
import ClassSubjectsGrid from '@/components/home/ClassSubjectsGrid';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import TrendingCourses from '@/components/home/TrendingCourses';
import FeaturedSubjects from '@/components/home/FeaturedSubjects';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import GoalsSection from '@/components/home/GoalsSection';
import MyLearnings from '@/components/home/MyLearnings';
import KidsSection from '@/components/home/KidsSection';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import LearningStats from '@/components/home/LearningStats';
import NewsletterSection from '@/components/home/NewsletterSection';

import { Palette, BorderRadius, Typography, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [key, setKey] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setKey(prev => prev + 1); // Force re-render of all sections
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.displayName || 'Learner'} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            What would you like to learn today?
          </Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Palette.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content sections */}
      <ScrollView
        key={key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.primary}
            colors={[Palette.primary]}
          />
        }
      >
        <HeroBanner />
        <ClassSubjectsGrid />
        <FeaturedCategories />
        <TrendingCourses />
        <KidsSection />
        <FeaturedSubjects />
        <FeaturedCourses />
        <GoalsSection />
        <MyLearnings />
        <TestimonialsCarousel />
        <LearningStats />
        <NewsletterSection />

        {/* Footer spacer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 56,
    paddingBottom: Spacing.lg,
    backgroundColor: Palette.bgCard,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  greeting: {
    ...Typography.h3,
    color: Palette.textPrimary,
  },
  greetingSubtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bgCardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: Palette.bgCardElevated,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  footerSpacer: {
    height: 80,
  },
});
