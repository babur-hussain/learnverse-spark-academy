import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Subject {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
}

interface Chapter {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  order_index: number;
  subject_id?: string;
}

interface Resource {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  resource_type: string;
  file_url?: string;
  external_url?: string;
  chapter_id?: string;
  subject_id?: string;
}

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resources' | 'chapters'>('resources');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, chapterRes, resourceRes] = await Promise.all([
          api.get(`/admin/subjects/${id}`),
          api.get('/admin/chapters', { params: { subject_id: id } }),
          api.get('/admin/subject_resources', { params: { subject_id: id } }),
        ]);
        setSubject(subjectRes.data?.data || subjectRes.data);
        setChapters(chapterRes.data?.data || chapterRes.data || []);
        setResources(resourceRes.data?.data || resourceRes.data || []);
      } catch (e) {
        console.error('Error fetching subject:', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const getResourcesByChapter = (chapterId: string) => {
    return resources.filter(r => r.chapter_id === chapterId);
  };

  const getResourceIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'video': return 'videocam';
      case 'link': return 'link';
      case 'file': return 'document-text';
      default: return 'document';
    }
  };

  const getResourceColor = (type: string): string => {
    switch (type) {
      case 'video': return Palette.purple;
      case 'link': return Palette.info;
      case 'file': return Palette.danger;
      default: return Palette.primary;
    }
  };

  const handleOpenResource = (resource: Resource) => {
    const url = resource.external_url || resource.file_url;
    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerLoading}>
          <Shimmer width="100%" height={250} borderRadius={0} />
        </View>
        <View style={{ padding: 20 }}>
          <Shimmer width="80%" height={24} />
          <Shimmer width="60%" height={16} style={{ marginTop: 12 }} />
          <Shimmer width="100%" height={80} style={{ marginTop: 20 }} />
          <Shimmer width="100%" height={80} style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={styles.centered}>
        <Ionicons name="book-outline" size={48} color={Palette.textMuted} />
        <Text style={styles.emptyText}>Subject not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subjectTitle = subject.title || subject.name || 'Subject';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: subject.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=300&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(15,23,42,0.3)', 'rgba(15,23,42,0.95)'] as any}
            style={styles.heroOverlay}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            {subject.is_featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{subjectTitle}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: `${Palette.primary}15` }]}>
            <Text style={[styles.statValue, { color: Palette.primary }]}>{chapters.length}</Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: `${Palette.purple}15` }]}>
            <Text style={[styles.statValue, { color: Palette.purple }]}>{resources.length}</Text>
            <Text style={styles.statLabel}>Resources</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: `${Palette.success}15` }]}>
            <Text style={[styles.statValue, { color: Palette.success }]}>{resources.filter(r => r.resource_type === 'video').length}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
        </View>

        {/* Description */}
        {subject.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{subject.description}</Text>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'resources' && styles.tabActive]}
            onPress={() => setActiveTab('resources')}
          >
            <Ionicons name="document-text" size={16} color={activeTab === 'resources' ? '#fff' : Palette.textMuted} />
            <Text style={[styles.tabText, activeTab === 'resources' && styles.tabTextActive]}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chapters' && styles.tabActive]}
            onPress={() => setActiveTab('chapters')}
          >
            <Ionicons name="list" size={16} color={activeTab === 'chapters' ? '#fff' : Palette.textMuted} />
            <Text style={[styles.tabText, activeTab === 'chapters' && styles.tabTextActive]}>Chapters</Text>
          </TouchableOpacity>
        </View>

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <View style={styles.section}>
            {resources.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="document-text-outline" size={48} color={Palette.textMuted} />
                <Text style={styles.emptyText}>No resources available yet</Text>
              </View>
            ) : (
              resources.map(resource => (
                <TouchableOpacity
                  key={resource._id || resource.id}
                  style={[styles.resourceCard, Shadow.sm]}
                  activeOpacity={0.85}
                  onPress={() => handleOpenResource(resource)}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: `${getResourceColor(resource.resource_type)}15` }]}>
                    <Ionicons name={getResourceIcon(resource.resource_type)} size={22} color={getResourceColor(resource.resource_type)} />
                  </View>
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    {resource.description && (
                      <Text style={styles.resourceDesc} numberOfLines={1}>{resource.description}</Text>
                    )}
                    <View style={styles.resourceMeta}>
                      <View style={styles.resourceBadge}>
                        <Text style={styles.resourceBadgeText}>{resource.resource_type}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={18} color={Palette.textMuted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <View style={styles.section}>
            {chapters.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="list-outline" size={48} color={Palette.textMuted} />
                <Text style={styles.emptyText}>No chapters available yet</Text>
              </View>
            ) : (
              chapters.sort((a, b) => a.order_index - b.order_index).map((chapter, index) => {
                const chapterResources = getResourcesByChapter(chapter._id || chapter.id || '');
                return (
                  <View key={chapter._id || chapter.id} style={[styles.chapterCard, Shadow.sm]}>
                    <LinearGradient
                      colors={Palette.gradientPrimary as any}
                      style={styles.chapterNumber}
                    >
                      <Text style={styles.chapterNumberText}>{index + 1}</Text>
                    </LinearGradient>
                    <View style={styles.chapterContent}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      {chapter.description && (
                        <Text style={styles.chapterDesc} numberOfLines={2}>{chapter.description}</Text>
                      )}
                      <Text style={styles.chapterMeta}>{chapterResources.length} resources</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  headerLoading: {
    width: '100%',
    height: 250,
  },
  centered: {
    flex: 1,
    backgroundColor: Palette.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.bgCardElevated,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    marginBottom: 8,
  },
  featuredText: {
    ...Typography.small,
    color: '#fff',
    fontWeight: '700',
  },
  heroTitle: {
    ...Typography.h1,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    fontSize: 24,
  },
  statLabel: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Palette.textSecondary,
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Palette.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Palette.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  resourceDesc: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  resourceMeta: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  resourceBadge: {
    backgroundColor: Palette.bgCardElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  resourceBadgeText: {
    ...Typography.small,
    color: Palette.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chapterNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  chapterNumberText: {
    ...Typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  chapterDesc: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  chapterMeta: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 4,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    ...Typography.body,
    color: Palette.textMuted,
    marginTop: 12,
  },
  goBackBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Palette.primary,
    borderRadius: BorderRadius.md,
  },
  goBackText: {
    ...Typography.button,
    color: '#fff',
  },
});
