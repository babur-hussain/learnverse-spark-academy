import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
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
  icon_url?: string;
  is_featured?: boolean;
}

interface Resource {
  _id?: string;
  id?: string;
  title: string;
  name?: string;
  description?: string;
  type?: string;
  resource_type: string;
  file_url?: string;
  external_url?: string;
  url?: string;
  subject_id?: string;
}

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, resourceRes] = await Promise.all([
          api.get(`/admin/subjects/${id}`),
          api.get('/admin/subject_resources', { params: { subject_id: id } }),
        ]);
        setSubject(subjectRes.data?.data || subjectRes.data);
        setResources(resourceRes.data?.data || resourceRes.data || []);
      } catch (e) {
        console.error('Error fetching subject:', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

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
    const url = resource.url || resource.external_url || resource.file_url;
    if (url) {
      router.push({
        pathname: '/resource-viewer' as any,
        params: { url: url, title: resource.title || resource.name || 'Resource', type: resource.type || resource.resource_type || 'document' }
      });
    }
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
            source={{ uri: subject.icon_url || subject.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=300&fit=crop' }}
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
          <View style={[styles.statCard, { backgroundColor: `${Palette.purple}15` }]}>
            <Text style={[styles.statValue, { color: Palette.purple }]}>{resources.length}</Text>
            <Text style={styles.statLabel}>Total Files</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: `${Palette.primary}15` }]}>
            <Text style={[styles.statValue, { color: Palette.primary }]}>{resources.filter(r => r.resource_type !== 'video').length}</Text>
            <Text style={styles.statLabel}>Documents</Text>
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

        {/* Resources Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {resources.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="document-text-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No resources available yet</Text>
            </View>
          ) : (
            <View style={styles.resourceGrid}>
              {resources.map((resource, index) => (
                <TouchableOpacity
                  key={resource._id || resource.id || index}
                  style={[styles.gridCard, Shadow.sm]}
                  activeOpacity={0.85}
                  onPress={() => handleOpenResource(resource)}
                >
                  <View style={[styles.gridIconHeader, { backgroundColor: `${getResourceColor(resource.resource_type)}15` }]}>
                    <Ionicons name={getResourceIcon(resource.resource_type)} size={32} color={getResourceColor(resource.resource_type)} />
                  </View>
                  <View style={styles.gridCardBody}>
                    <Text style={styles.gridCardName} numberOfLines={2}>{resource.title || resource.name || 'Resource'}</Text>
                    <View style={styles.gridCardMeta}>
                      <Text style={styles.gridCardExt}>{resource.resource_type}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  gridIconHeader: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardBody: {
    padding: Spacing.md,
  },
  gridCardName: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    height: 36,
  },
  gridCardMeta: {
    flexDirection: 'row',
  },
  gridCardExt: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '800',
    backgroundColor: Palette.bg,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    textTransform: 'uppercase',
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
