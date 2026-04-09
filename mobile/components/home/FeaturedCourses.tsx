import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/lib/api';
import SectionHeader from './SectionHeader';
import CourseCard from '@/components/ui/CourseCard';
import { ShimmerCard } from '@/components/ui/LoadingShimmer';
import { Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Course {
  _id?: string;
  id?: string;
  title: string;
  short_description?: string;
  thumbnail_url?: string;
  price?: number;
}

const FeaturedCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/featured_courses', { params: { is_active: true, order_by: 'order_index', sort: 'asc' } });
        const data = res.data?.data || res.data || [];
        setCourses(data.slice(0, 6));
      } catch (e) {
        console.error('Error fetching featured courses:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Featured Courses" subtitle="Curated just for you" />
        {[1, 2].map(i => <ShimmerCard key={i} style={{ marginHorizontal: 20 }} />)}
      </View>
    );
  }

  if (courses.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Featured Courses" subtitle="Curated just for you" actionText="See All" onAction={() => router.push('/catalog' as any)} />
      {courses.map(item => (
        <View key={item._id || item.id} style={styles.cardWrapper}>
          <CourseCard
            id={item._id || item.id || ''}
            title={item.title}
            description={item.short_description}
            thumbnailUrl={item.thumbnail_url}
            price={item.price}
            width={SCREEN_WIDTH - 40}
            onPress={() => router.push(`/course/${item._id || item.id}` as any)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  cardWrapper: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
});

export default FeaturedCourses;
