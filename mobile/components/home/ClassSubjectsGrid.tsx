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
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2;

interface ClassItem {
  _id?: string;
  id?: string;
  name: string;
  order?: number;
}

interface SubjectItem {
  _id?: string;
  id?: string;
  title: string;
  thumbnail_url?: string;
  icon_url?: string;
}

const CLASS_COLORS: any[] = [
  ['#3b82f6', '#2563eb'],
  ['#8b5cf6', '#7c3aed'],
  ['#10b981', '#059669'],
  ['#f97316', '#ea580c'],
  ['#ec4899', '#db2777'],
  ['#06b6d4', '#0891b2'],
];

const ClassSubjectsGrid: React.FC = () => {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassId = async () => {
      try {
        const classId = await AsyncStorage.getItem('user_class_id');
        if (classId) setSelectedClass(classId);
      } catch (e) {
        console.error('Error fetching class from storage:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClassId();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const controller = new AbortController();
    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      try {
        const res = await api.get('/admin/subjects', { 
          params: { class_id: selectedClass },
          signal: controller.signal
        });
        setSubjects(res.data?.data || res.data || []);
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.error('Error fetching subjects:', e);
        }
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetchSubjects();
    return () => controller.abort();
  }, [selectedClass]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Your Subjects" subtitle="Loading your configuration..." />
        <View style={styles.shimmerRow}>
          <Shimmer width={CARD_WIDTH} height={120} borderRadius={16} />
          <Shimmer width={CARD_WIDTH} height={120} borderRadius={16} style={{ marginLeft: 16 }} />
        </View>
      </View>
    );
  }

  if (!selectedClass) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Your Subjects" subtitle="Configure your class to see subjects" />
        <View style={styles.emptyContainer}>
          <Ionicons name="settings-outline" size={40} color={Palette.textMuted} />
          <Text style={styles.emptyText}>Please configure your Class/College in Profile</Text>
          <TouchableOpacity onPress={() => router.push('/edit-profile' as any)} style={styles.profileBtn}>
            <Text style={styles.profileBtnText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Your Subjects" subtitle="Explore subjects for your class" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader title="Your Subjects" subtitle="Explore subjects for your class" />

      {/* Subject grid */}
      {subjectsLoading ? (
        <View style={styles.subjectGrid}>
          {[1, 2, 3, 4].map(i => (
            <Shimmer key={i} width={CARD_WIDTH} height={120} borderRadius={16} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : subjects.length > 0 ? (
        <View style={styles.subjectGrid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject._id || subject.id}
              style={[styles.subjectCard, Shadow.sm]}
              activeOpacity={0.85}
              onPress={() => router.push(`/subject/${subject._id || subject.id}` as any)}
            >
              <Image
                source={{ uri: subject.icon_url || subject.thumbnail_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=120&fit=crop' }}

                style={styles.subjectImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
                style={styles.subjectOverlay}
              />
              <View style={styles.subjectContent}>
                <Text style={styles.subjectTitle} numberOfLines={2}>{subject.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={40} color={Palette.textMuted} />
          <Text style={styles.emptyText}>No subjects for this class yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  shimmerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
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
  profileBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Palette.bgCardElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  profileBtnText: {
    color: Palette.primary,
    ...Typography.button,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  subjectCard: {
    width: CARD_WIDTH,
    height: 120,
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
  subjectOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  subjectContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  subjectTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    ...Typography.body,
    color: Palette.textMuted,
    marginTop: 8,
  },
});

export default ClassSubjectsGrid;
