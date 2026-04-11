import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/admin/classes', { params: { is_active: true } });
        const data = res.data?.data || res.data || [];
        setClasses(data);
        if (data.length > 0) {
          const firstId = data[0]._id || data[0].id;
          setSelectedClass(firstId);
        }
      } catch (e) {
        console.error('Error fetching classes:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      try {
        const res = await api.get('/admin/subjects', { params: { class_id: selectedClass } });
        setSubjects(res.data?.data || res.data || []);
      } catch (e) {
        console.error('Error fetching subjects:', e);
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Your Class" subtitle="Pick your class to see subjects" />
        <View style={styles.shimmerRow}>
          {[1, 2, 3, 4].map(i => (
            <Shimmer key={i} width={80} height={36} borderRadius={18} style={{ marginRight: 10 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader title="Your Class" subtitle="Pick your class to see subjects" />

      {/* Class pills */}
      <FlatList
        data={classes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item._id || item.id || item.name}
        contentContainerStyle={styles.pillsContainer}
        renderItem={({ item, index }) => {
          const id = item._id || item.id || '';
          const isSelected = id === selectedClass;
          const colors = CLASS_COLORS[index % CLASS_COLORS.length];
          return (
            <TouchableOpacity
              onPress={() => setSelectedClass(id)}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <LinearGradient
                  colors={colors as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.classPill}
                >
                  <Text style={styles.classPillTextActive}>{item.name}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.classPillInactive}>
                  <Text style={styles.classPillText}>{item.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

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
  pillsContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: 10,
  },
  classPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  classPillInactive: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.bgCard,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  classPillTextActive: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  classPillText: {
    ...Typography.caption,
    color: Palette.textSecondary,
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
