import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import SectionHeader from './SectionHeader';
import CourseCard from '@/components/ui/CourseCard';
import { ShimmerCard } from '@/components/ui/LoadingShimmer';
import { Palette, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

interface Course {
  _id?: string;
  id?: string;
  title: string;
  short_description?: string;
  thumbnail_url?: string;
  price?: number;
}

const TrendingCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setError(null);
        const res = await api.get('/admin/courses', { signal: controller.signal });
        const data = res.data?.data || res.data || [];
        setCourses(data.slice(0, 8));
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.error('Error fetching trending courses:', e);
          setError('Failed to load courses.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Trending Courses" subtitle="Most popular right now" />
        <FlatList
          horizontal
          data={[1, 2, 3]}
          keyExtractor={i => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={() => <ShimmerCard style={{ width: CARD_WIDTH, marginRight: 16 }} />}
        />
      </View>
    );
  }

  if (error && courses.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Trending Courses" subtitle="Most popular right now" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (courses.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Trending Courses"
        subtitle="Most popular right now"
        actionText="See All"
        onAction={() => router.push('/catalog' as any)}
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
            description={item.short_description}
            thumbnailUrl={item.thumbnail_url}
            price={item.price}
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
  errorContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    backgroundColor: `${Palette.danger}15`,
    marginHorizontal: Spacing.xl,
    borderRadius: 8,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  errorText: {
    color: Palette.danger,
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
});

export default TrendingCourses;
