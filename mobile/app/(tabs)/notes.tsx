import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, RefreshControl, Dimensions, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { getEnrolledCourseIds } from '@/hooks/useEnrollment';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  name?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  photo_url?: string;
  class_name?: string;
  enrolled_courses?: number;
}

interface Resource {
  id?: string;
  _id?: string;
  name: string;
  title?: string;
  url?: string;
  mime_type?: string;
  type?: string;
  course_title?: string;
  course_id?: string;
  created_at?: string;
  updated_at?: string;
  size?: number;
}

interface Course {
  id?: string;
  _id?: string;
  title: string;
  subject?: string;
  thumbnail_url?: string;
  resource_count?: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getExt(resource: Resource): string {
  const name = resource.title || resource.name || '';
  const url = resource.url || '';
  return (name.split('.').pop() || url.split('?')[0].split('.').pop() || '').toLowerCase();
}

function getFileIcon(ext: string): { icon: keyof typeof Ionicons.glyphMap; color: string } {
  if (['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(ext)) return { icon: 'videocam', color: '#8b5cf6' };
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return { icon: 'musical-notes', color: '#ec4899' };
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return { icon: 'image', color: '#f97316' };
  if (ext === 'pdf') return { icon: 'document-text', color: '#ef4444' };
  if (['doc', 'docx'].includes(ext)) return { icon: 'document', color: '#3b82f6' };
  if (['ppt', 'pptx'].includes(ext)) return { icon: 'easel', color: '#f59e0b' };
  if (['xls', 'xlsx'].includes(ext)) return { icon: 'grid', color: '#10b981' };
  if (['srt', 'vtt', 'txt'].includes(ext)) return { icon: 'text', color: '#64748b' };
  return { icon: 'document-outline', color: '#FF6B35' };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function UserAvatar({ profile, size = 44 }: { profile: UserProfile | null; size?: number }) {
  const fireUser = auth.currentUser;
  const photoUrl = profile?.avatar_url || profile?.photo_url || fireUser?.photoURL;
  const name = profile?.name || profile?.display_name || fireUser?.displayName || 'U';
  const initial = name[0].toUpperCase();

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: Palette.primary }}
        contentFit="cover"
      />
    );
  }
  return (
    <LinearGradient
      colors={['#FF6B35', '#FFB84D']}
      style={{ width: size, height: size, borderRadius: size / 2, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: size * 0.42, fontWeight: '700', color: '#fff' }}>{initial}</Text>
    </LinearGradient>
  );
}

// ─── Stats Strip ───────────────────────────────────────────────────────────────
function StatsStrip({ total, courses }: { total: number; courses: number }) {
  return (
    <View style={styles.statsStrip}>
      {[
        { icon: 'document-text', label: 'Total Files', value: total, color: Palette.primary },
        { icon: 'book', label: 'From Courses', value: courses, color: '#8b5cf6' },
      ].map(s => (
        <View key={s.label} style={styles.statItem}>
          <View style={[styles.statIconBg, { backgroundColor: `${s.color}15` }]}>
            <Ionicons name={s.icon as any} size={18} color={s.color} />
          </View>
          <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
          <Text style={styles.statLbl}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Search Bar ────────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color={Palette.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search files, subjects…"
        placeholderTextColor={Palette.textMuted}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={18} color={Palette.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── Course Chip Row ────────────────────────────────────────────────────────────
function CourseChips({ courses, selected, onSelect }: {
  courses: Course[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
      <TouchableOpacity
        style={[styles.chip, selected === null && styles.chipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.chipText, selected === null && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>
      {courses.map(c => {
        const id = c.id || c._id || '';
        const active = selected === id;
        return (
          <TouchableOpacity key={id} style={[styles.chip, active && styles.chipActive]} onPress={() => onSelect(id)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>{c.title}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Resource Card ──────────────────────────────────────────────────────────────
function ResourceCard({ resource, index, onOpen }: { resource: Resource; index: number; onOpen: (r: Resource) => void }) {
  const slideAnim = useRef(new Animated.Value(24)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ext = getExt(resource);
  const { icon, color } = getFileIcon(ext);
  const name = resource.title || resource.name || 'Untitled';
  const date = timeAgo(resource.updated_at || resource.created_at);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      <TouchableOpacity style={[styles.resourceCard, Shadow.sm]} onPress={() => onOpen(resource)} activeOpacity={0.85}>
        <View style={[styles.fileIconWrap, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={26} color={color} />
        </View>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceName} numberOfLines={2}>{name}</Text>
          {resource.course_title ? (
            <Text style={styles.resourceCourse} numberOfLines={1}>{resource.course_title}</Text>
          ) : null}
          <View style={styles.resourceMeta}>
            {ext ? <View style={[styles.extBadge, { backgroundColor: `${color}15` }]}>
              <Text style={[styles.extText, { color }]}>{ext.toUpperCase()}</Text>
            </View> : null}
            {date ? <Text style={styles.resourceDate}>{date}</Text> : null}
          </View>
        </View>
        <TouchableOpacity style={styles.openBtn} onPress={() => onOpen(resource)}>
          <Ionicons name="open-outline" size={18} color={Palette.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ search }: { search: boolean }) {
  return (
    <View style={styles.emptyCard}>
      <LinearGradient colors={['#FFF0E5', '#FFF8F0']} style={styles.emptyIconBg}>
        <Ionicons name={search ? 'search-outline' : 'lock-closed-outline'} size={36} color={Palette.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>{search ? 'No Results Found' : 'No Enrolled Courses'}</Text>
      <Text style={styles.emptyDesc}>
        {search
          ? 'Try a different search term or filter.'
          : 'Enroll in courses first to access their files and resources here.'}
      </Text>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Fetch profile + all courses in parallel
      const [profileRes, coursesRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/admin/courses'),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);

      const allCourses: Course[] = coursesRes.status === 'fulfilled'
        ? (Array.isArray(coursesRes.value.data) ? coursesRes.value.data : coursesRes.value.data?.data || [])
        : [];

      // 2. Filter only enrolled courses
      const enrolledIds = await getEnrolledCourseIds();
      const enrolledCourses = allCourses.filter(c => enrolledIds.includes(String(c.id || c._id || '')));
      setCourses(enrolledCourses);

      if (enrolledCourses.length === 0) {
        setResources([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 3. Fetch resources only from enrolled courses
      const resourceResults = await Promise.allSettled(
        enrolledCourses.slice(0, 10).map(c =>
          api.get('/admin/course_resources', { params: { course_id: c.id || c._id } })
            .then(r => {
              const items = Array.isArray(r.data) ? r.data : r.data?.data || [];
              return items.map((item: Resource) => ({
                ...item,
                id: item.id || item._id || String(Math.random()),
                course_title: c.title,
                course_id: String(c.id || c._id),
              }));
            })
        )
      );

      const allResources: Resource[] = [];
      resourceResults.forEach(r => { if (r.status === 'fulfilled') allResources.push(...r.value); });
      allResources.sort((a, b) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
      );
      setResources(allResources);
    } catch (e) {
      console.error('Notes fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  }, []);

  const fireUser = auth.currentUser;
  const userName = profile?.name || profile?.display_name || fireUser?.displayName || 'Learner';
  const firstName = userName.split(' ')[0];

  // Filtered resources
  const filtered = resources.filter(r => {
    const nameMatch = (r.title || r.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const courseMatch = selectedCourse ? r.course_id === selectedCourse : true;
    return nameMatch && courseMatch;
  });

  const handleOpen = (r: Resource) => {
    if (!r.url) return;
    router.push({
      pathname: '/resource-viewer' as any,
      params: {
        url: r.url,
        title: r.title || r.name || 'File',
        type: r.mime_type || r.type || getExt(r),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <Animated.View style={{
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }]
      }}>
        <LinearGradient
          colors={['#FFF5EB', '#FFF8F0']}
          style={[styles.header, { paddingTop: insets.top + 14 }]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{getGreeting()}, {firstName}! 👋</Text>
              <Text style={styles.headerTitle}>Your Notes</Text>
              <Text style={styles.headerSub}>Study materials from all your courses</Text>
            </View>
            <UserAvatar profile={profile} size={52} />
          </View>

          {!loading && (
            <StatsStrip total={resources.length} courses={courses.length} />
          )}
        </LinearGradient>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loadingText}>Loading your files…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAll(true); }}
              tintColor={Palette.primary}
              colors={[Palette.primary]}
            />
          }
        >
          {/* Search */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Course filter chips */}
          {courses.length > 0 && (
            <CourseChips courses={courses} selected={selectedCourse} onSelect={setSelectedCourse} />
          )}

          {/* Section header */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              {selectedCourse
                ? courses.find(c => (c.id || c._id) === selectedCourse)?.title || 'Files'
                : 'All Files'}
            </Text>
            <Text style={styles.sectionCount}>{filtered.length} files</Text>
          </View>

          {/* Resource list */}
          {filtered.length === 0 ? (
            <EmptyState search={!!searchQuery} />
          ) : (
            filtered.map((r, i) => (
              <ResourceCard key={r.id || i} resource={r} index={i} onOpen={handleOpen} />
            ))
          )}

          {/* Premium CTA */}
          <TouchableOpacity activeOpacity={0.85} style={{ marginTop: Spacing['2xl'] }}>
            <LinearGradient
              colors={['#FF6B35', '#FFB84D']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.paidCta}
            >
              <View style={styles.ctaIconBg}>
                <Ionicons name="diamond" size={22} color="#FF6B35" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Unlock Premium Notes</Text>
                <Text style={styles.ctaDesc}>Expert-curated notes with detailed explanations</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },

  // Header
  header: { paddingHorizontal: Spacing.xl, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { ...Typography.small, color: Palette.primary, fontWeight: '700', letterSpacing: 0.3, marginBottom: 2 },
  headerTitle: { ...Typography.h1, color: Palette.textPrimary },
  headerSub: { ...Typography.caption, color: Palette.textSecondary, marginTop: 3 },

  // Stats strip
  statsStrip: {
    flexDirection: 'row', gap: 12, marginTop: 16,
  },
  statItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8, ...Shadow.sm,
  },
  statIconBg: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  statVal: { ...Typography.bodyBold, fontSize: 16 },
  statLbl: { ...Typography.small, color: Palette.textMuted, flex: 1 },

  // Scroll
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 100 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14, gap: 10,
    borderWidth: 1, borderColor: Palette.border,
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: Palette.textPrimary,
  },

  // Chips
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.bgCard,
    borderWidth: 1, borderColor: Palette.border,
    maxWidth: 150,
  },
  chipActive: {
    backgroundColor: Palette.primary, borderColor: Palette.primary,
  },
  chipText: { ...Typography.small, color: Palette.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // Section row
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  sectionTitle: { ...Typography.h3, color: Palette.textPrimary },
  sectionCount: { ...Typography.small, color: Palette.textMuted },

  // Resource card
  resourceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Palette.border,
  },
  fileIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  resourceInfo: { flex: 1 },
  resourceName: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 13, lineHeight: 19 },
  resourceCourse: { ...Typography.small, color: Palette.primary, marginTop: 2, fontWeight: '600' },
  resourceMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  extBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  extText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  resourceDate: { ...Typography.small, color: Palette.textMuted },
  openBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${Palette.primary}12`,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 6,
  },

  // Empty
  emptyCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['3xl'],
    alignItems: 'center',
    borderWidth: 1, borderColor: Palette.border,
    borderStyle: 'dashed',
  },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.h3, color: Palette.textPrimary, textAlign: 'center' },
  emptyDesc: { ...Typography.body, color: Palette.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  // Premium CTA
  paidCta: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.lg,
  },
  ctaIconBg: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  ctaTitle: { ...Typography.bodyBold, color: '#fff' },
  ctaDesc: { ...Typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { ...Typography.body, color: Palette.textMuted },
});
