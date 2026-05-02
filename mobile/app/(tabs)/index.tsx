import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

// Home sections
import AIBuddyCard from '@/components/home/AIBuddyCard';
import LibraryCard from '@/components/home/LibraryCard';
import ClassSubjectsGrid from '@/components/home/ClassSubjectsGrid';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import { useSidebar } from '@/components/SidebarContext';
import TrendingCourses from '@/components/home/TrendingCourses';
import FeaturedSubjects from '@/components/home/FeaturedSubjects';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import GoalsSection from '@/components/home/GoalsSection';
import MyLearnings from '@/components/home/MyLearnings';
import KidsSection from '@/components/home/KidsSection';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import LearningStats from '@/components/home/LearningStats';
import NewsletterSection from '@/components/home/NewsletterSection';

import { Palette, BorderRadius, Typography, Spacing, Shadow } from '@/constants/theme';

const MemoAIBuddyCard = memo(AIBuddyCard);
const MemoLibraryCard = memo(LibraryCard);
const MemoMyLearnings = memo(MyLearnings);
const MemoKidsSection = memo(KidsSection);
const MemoNewsletterSection = memo(NewsletterSection);

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [key, setKey] = React.useState(0);
  const { openSidebar } = useSidebar();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setKey(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const user = auth.currentUser;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar — matching reference design */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
          <Ionicons name="menu-outline" size={28} color={Palette.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity style={[styles.subscribeBadge, Shadow.sm]}>
            <Ionicons name="sparkles" size={16} color="#FF6B35" />
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content sections */}
      <ScrollView
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
        {/* AI Buddy Card — hero section */}
        <MemoAIBuddyCard />

        {/* Library Card */}
        <MemoLibraryCard />

        {/* Made just for you — Trending Courses */}
        <View style={styles.madeForYou}>
          <View style={styles.madeForYouHeader}>
            <Text style={styles.sectionTitle}>Made just for you</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TrendingCourses key={`tc-${key}`} />

        {/* Existing sections with new styling */}
        <ClassSubjectsGrid key={`csg-${key}`} />
        <FeaturedCategories key={`fc-${key}`} />
        <MemoKidsSection />
        <FeaturedSubjects key={`fs-${key}`} />
        <FeaturedCourses key={`fc2-${key}`} />
        <GoalsSection key={`gs-${key}`} />
        <MemoMyLearnings />
        <TestimonialsCarousel key={`tc2-${key}`} />
        <LearningStats key={`ls-${key}`} />
        <MemoNewsletterSection />

        {/* Footer spacer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Palette.bg,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscribeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E5',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  subscribeText: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  madeForYou: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  madeForYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.h2,
    color: Palette.textPrimary,
  },
  seeAll: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  footerSpacer: {
    height: 80,
  },
});
