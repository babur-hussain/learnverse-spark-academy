import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ClassData {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
}

interface SubjectItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
}

export default function StudyClassScreen() {
  const { classId } = useLocalSearchParams();
  const router = useRouter();

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch class info
        const classRes = await api.get('/admin/classes', { params: { is_active: true } });
        const allClasses = classRes.data?.data || classRes.data || [];
        const found = allClasses.find((c: any) =>
          (c._id || c.id) === classId || c.slug === classId
        );
        if (found) setClassData(found);

        // Fetch subjects for this class
        if (found) {
          const subjectRes = await api.get('/admin/class_subjects', {
            params: { class_id: found._id || found.id, order_by: 'order_index', sort: 'asc' }
          });
          const data = subjectRes.data?.data || subjectRes.data || [];
          // Extract the subject from the mapping
          const subs = data.map((row: any) => row.subjects || row).filter(Boolean);
          setSubjects(subs);
        }
      } catch (e) {
        console.error('Error fetching study class:', e);
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchData();
  }, [classId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ padding: 20, paddingTop: 60 }}>
          <Shimmer width={40} height={40} borderRadius={20} />
          <Shimmer width="60%" height={28} style={{ marginTop: 20 }} />
          <Shimmer width="40%" height={16} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
            {[1, 2, 3, 4].map(i => (
              <Shimmer key={i} width={(SCREEN_WIDTH - 56) / 2} height={200} borderRadius={16} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="school-outline" size={48} color={Palette.textMuted} />
        <Text style={styles.emptyText}>Class not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e293b', '#0f172a'] as any}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>

          <View style={styles.classInfo}>
            <View style={styles.classAvatar}>
              {classData.icon ? (
                <Image source={{ uri: classData.icon }} style={styles.classAvatarImage} />
              ) : (
                <Text style={styles.classAvatarText}>{classData.name?.[0] || '?'}</Text>
              )}
            </View>
            <View style={styles.classDetails}>
              <Text style={styles.className}>{classData.name}</Text>
              {classData.description && (
                <Text style={styles.classDesc} numberOfLines={2}>{classData.description}</Text>
              )}
              <View style={styles.classStats}>
                <View style={styles.classStat}>
                  <Ionicons name="book" size={14} color={Palette.primary} />
                  <Text style={styles.classStatText}>{subjects.length} Subjects</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subjects</Text>

          {subjects.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="book-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyTitle}>No subjects yet</Text>
              <Text style={styles.emptySubtitle}>Subjects will appear here once they're assigned to this class.</Text>
            </View>
          ) : (
            <View style={styles.subjectGrid}>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject._id || subject.id}
                  style={[styles.subjectCard, Shadow.md]}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/subject/${subject._id || subject.id}` as any)}
                >
                  <View style={styles.subjectImageContainer}>
                    <Image
                      source={{ uri: subject.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=200&fit=crop' }}
                      style={styles.subjectImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(15, 23, 42, 0.7)'] as any}
                      style={styles.subjectImageOverlay}
                    />
                  </View>
                  <View style={styles.subjectContent}>
                    <Text style={styles.subjectTitle} numberOfLines={2}>{subject.title}</Text>
                    {subject.description && (
                      <Text style={styles.subjectDesc} numberOfLines={2}>{subject.description}</Text>
                    )}
                    <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
                      <LinearGradient
                        colors={Palette.gradientPrimary as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.viewBtnGradient}
                      >
                        <Text style={styles.viewBtnText}>View Resources</Text>
                      </LinearGradient>
                    </TouchableOpacity>
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
  centered: {
    flex: 1,
    backgroundColor: Palette.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 56,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bgCardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Palette.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  classAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  classAvatarText: {
    ...Typography.h1,
    color: Palette.primary,
    fontSize: 28,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    ...Typography.h1,
    color: Palette.textPrimary,
    fontSize: 24,
  },
  classDesc: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  classStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  classStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classStatText: {
    ...Typography.small,
    color: Palette.textMuted,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Palette.textPrimary,
    marginBottom: Spacing.lg,
  },
  subjectGrid: {
    gap: Spacing.lg,
  },
  subjectCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  subjectImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  subjectImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.bgCardElevated,
  },
  subjectImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  subjectContent: {
    padding: Spacing.lg,
  },
  subjectTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    fontSize: 16,
  },
  subjectDesc: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  viewBtn: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  viewBtnGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  viewBtnText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 14,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: Spacing.xl,
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
