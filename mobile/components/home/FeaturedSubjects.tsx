import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';
import SectionHeader from './SectionHeader';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;

function isValidUrl(str: string | undefined): boolean {
  return !!str && (str.startsWith('http://') || str.startsWith('https://'));
}

interface Subject {
  _id?: string;
  id?: string;
  title: string;
  thumbnail_url?: string;
  icon_url?: string;
  is_featured?: boolean;
}

const FeaturedSubjects: React.FC = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setError(null);
        const classId = await AsyncStorage.getItem('user_class_id');
        
        if (!classId) {
          setSubjects([]);
          setLoading(false);
          return;
        }

        const res = await api.get('/admin/subjects', { 
          params: { is_featured: true, class_id: classId, sort: 'title', order: 'asc' },
          signal: controller.signal
        });
        setSubjects(res.data?.data || res.data || []);
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.error('Error fetching featured subjects:', e);
          setError('Failed to load featured subjects.');
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
        <SectionHeader title="Featured Subjects" subtitle="Hand-picked for you" />
        <FlatList
          horizontal
          data={[1, 2, 3]}
          keyExtractor={i => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={() => <Shimmer width={CARD_WIDTH} height={160} borderRadius={16} style={{ marginRight: 12 }} />}
        />
      </View>
    );
  }

  if (error && subjects.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Featured Subjects" subtitle="Hand-picked for you" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (subjects.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Featured Subjects" subtitle="Hand-picked for you" actionText="See All" onAction={() => router.push('/catalog' as any)} />
      <FlatList
        horizontal
        data={subjects}
        keyExtractor={item => item._id || item.id || Math.random().toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const imageUrl = item.icon_url || item.thumbnail_url;
          return (
            <TouchableOpacity style={[styles.card, Shadow.sm]} activeOpacity={0.85}
              onPress={() => router.push(`/subject/${item._id || item.id}` as any)}>
              <Image
                source={{ uri: isValidUrl(imageUrl) ? imageUrl : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=160&fit=crop' }}
                style={styles.image}
                resizeMode="cover"
              />
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.95)']}
              style={styles.overlay}
            />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </View>
            {item.is_featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐ Featured</Text>
              </View>
            )}
          </TouchableOpacity>
          );
        }}
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
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Palette.danger,
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.bgCard,
    marginRight: Spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.bgCardElevated,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  featuredText: {
    ...Typography.small,
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
  },
});

export default FeaturedSubjects;
