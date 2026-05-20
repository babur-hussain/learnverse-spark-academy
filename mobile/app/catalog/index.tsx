import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { Shimmer, ShimmerCard } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2;

interface Subject {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  thumbnail_url?: string;
  icon_url?: string;
  class_id?: string;
  is_featured?: boolean;
}

interface ClassItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
}

export default function CatalogScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const [search, setSearch] = useState((params.q as string) || '');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          api.get('/admin/classes', { params: { is_active: true } }),
          api.get('/admin/subjects', { params: { sort: 'title', order: 'asc' } }),
        ]);
        setClasses(classRes.data?.data || classRes.data || []);
        setSubjects(subjectRes.data?.data || subjectRes.data || []);
      } catch (e) {
        console.error('Error fetching catalog:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = subjects.filter(s => {
    let match = true;
    
    // Class filter
    if (selectedClass !== 'all') {
      match = s.class_id === selectedClass;
    }
    
    // Search filter
    if (match && search) {
      const subjectName = s.title || s.name || '';
      match = subjectName.toLowerCase().includes(search.toLowerCase());
    }
    
    return match;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFF5EB', '#FFF8F0']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Subject Catalog</Text>
        <Text style={styles.subtitle}>Browse all available subjects</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Palette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
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

        {/* Class filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedClass('all')}
            activeOpacity={0.8}
          >
            {selectedClass === 'all' ? (
              <LinearGradient
                colors={Palette.gradientPrimary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.filterPill}
              >
                <Text style={styles.filterPillTextActive}>All</Text>
              </LinearGradient>
            ) : (
              <View style={styles.filterPillInactive}>
                <Text style={styles.filterPillText}>All</Text>
              </View>
            )}
          </TouchableOpacity>
          {classes.map(cls => {
            const id = cls._id || cls.id || '';
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setSelectedClass(id)}
                activeOpacity={0.8}
              >
                {selectedClass === id ? (
                  <LinearGradient
                    colors={Palette.gradientPrimary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.filterPill}
                  >
                    <Text style={styles.filterPillTextActive}>{cls.name}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterPillInactive}>
                    <Text style={styles.filterPillText}>{cls.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* Subject Grid */}
      {loading ? (
        <View style={styles.gridContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Shimmer key={i} width={CARD_WIDTH} height={180} borderRadius={16} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No subjects found</Text>
            </View>
          ) : (
            filtered.map(subject => (
              <TouchableOpacity
                key={subject._id || subject.id}
                style={[styles.subjectCard, Shadow.md]}
                activeOpacity={0.85}
                onPress={() => router.push(`/subject/${subject._id || subject.id}` as any)}
              >
                <Image
                  source={{ uri: subject.icon_url || subject.thumbnail_url || 'https://images.unsplash.com/photo-1546410531-bd4cb01bd15d?w=200&h=140&fit=crop' }}
                  style={styles.subjectImage}
                  resizeMode="cover"
                />
                
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.subjectTitleOverlay}
                >
                  <Text style={styles.subjectTitleText} numberOfLines={2}>
                    {subject.title || subject.name}
                  </Text>
                </LinearGradient>

                {subject.is_featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>⭐ Featured</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
    // paddingTop handled via inline style with insets.top
    paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bgCardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    gap: 10,
    paddingBottom: 4,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  subjectCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.bgCard,
    position: 'relative',
  },
  subjectImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.bgCardElevated,
  },
  subjectTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingTop: 30,
  },
  subjectTitleText: {
    ...Typography.bodyBold,
    color: '#fff',
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
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Palette.textMuted,
    marginTop: 12,
  },
});
