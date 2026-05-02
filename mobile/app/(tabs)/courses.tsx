import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import CourseCard from '@/components/ui/CourseCard';
import { ShimmerCard } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Course {
  _id?: string;
  id?: string;
  title: string;
  short_description?: string;
  thumbnail_url?: string;
  price?: number;
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/admin/courses');
        const data = res.data?.data || res.data || [];
        setCourses(data);
        setFilteredCourses(data);
      } catch (e) {
        console.error('Error fetching courses:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    let result = courses;
    if (search) {
      result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter === 'free') {
      result = result.filter(c => !c.price || c.price === 0);
    } else if (filter === 'paid') {
      result = result.filter(c => c.price && c.price > 0);
    }
    setFilteredCourses(result);
  }, [search, filter, courses]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFF8F0', '#FFF5EB']}
        style={styles.header}
      >
        <Text style={styles.title}>Courses</Text>
        <Text style={styles.subtitle}>{courses.length} courses available</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Palette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={Palette.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={Palette.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {(['all', 'free', 'paid'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              {filter === f ? (
                <LinearGradient
                  colors={Palette.gradientPrimary as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filterPill}
                >
                  <Text style={styles.filterPillTextActive}>{f === 'all' ? 'All' : f === 'free' ? 'Free' : 'Paid'}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterPillInactive}>
                  <Text style={styles.filterPillText}>{f === 'all' ? 'All' : f === 'free' ? 'Free' : 'Paid'}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Course list */}
      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3].map(i => <ShimmerCard key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={item => item._id || item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No courses found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CourseCard
              id={item._id || item.id || ''}
              title={item.title}
              description={item.short_description}
              thumbnailUrl={item.thumbnail_url}
              price={item.price}
              width={SCREEN_WIDTH - 32}
              onPress={() => router.push(`/course/${item._id || item.id}` as any)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  title: {
    ...Typography.h1,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCardElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    gap: 10,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Palette.textPrimary,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  filterPillInactive: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.bgCard,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  filterPillTextActive: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  filterPillText: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Palette.textMuted,
    marginTop: 12,
  },
});
