import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SectionHeader from './SectionHeader';
import CourseCard from '@/components/ui/CourseCard';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useNotesStore, notesActions } from '@/store/notesStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

const MyLearnings: React.FC = () => {
  const router = useRouter();
  const { courses, loading } = useNotesStore();

  useEffect(() => {
    // If we haven't loaded courses yet and we aren't already loading, fetch them
    if (courses.length === 0) {
      notesActions.fetchProfileAndCourses();
    }
  }, []);

  if (loading && courses.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title="My Learnings" subtitle="Continue where you left off" />
        <View style={[styles.emptyCard, { paddingVertical: Spacing['3xl'], alignItems: 'center' }]}>
          <ActivityIndicator size="small" color={Palette.primary} />
        </View>
      </View>
    );
  }

  if (courses.length === 0) {
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
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/catalog' as any)}>
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
  }

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="My Learnings" 
        subtitle="Continue where you left off" 
        actionText="View All"
        onAction={() => router.push('/(tabs)/notes' as any)}
      />
      <FlatList
        horizontal
        data={courses}
        keyExtractor={item => item._id || item.id || Math.random().toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <CourseCard
            id={item._id || item.id || ''}
            title={item.title}
            description={item.subject || 'Enrolled Course'}
            thumbnailUrl={item.thumbnail_url}
            bannerUrl={item.banner_url}
            compact
            width={CARD_WIDTH}
            onPress={() => router.push(`/course/${item._id || item.id}` as any)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  list: {
    paddingHorizontal: Spacing.xl,
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
