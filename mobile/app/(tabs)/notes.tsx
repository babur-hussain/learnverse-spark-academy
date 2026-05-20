import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, RefreshControl, Dimensions, ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '@/lib/firebase';
import { useNotesStore, notesActions, getExt, getFileCategory } from '@/store/notesStore';

const { width: SCREEN_W } = Dimensions.get('window');

const COURSE_THEMES = [
  { icon: 'book', colors: ['#60a5fa', '#3b82f6'], textColor: '#3b82f6' },
  { icon: 'flask', colors: ['#a78bfa', '#8b5cf6'], textColor: '#8b5cf6' },
  { icon: 'calculator', colors: ['#f472b6', '#ec4899'], textColor: '#ec4899' },
  { icon: 'globe', colors: ['#34d399', '#10b981'], textColor: '#10b981' },
  { icon: 'language', colors: ['#fbbf24', '#f59e0b'], textColor: '#f59e0b' },
  { icon: 'library', colors: ['#f87171', '#ef4444'], textColor: '#ef4444' },
  { icon: 'desktop', colors: ['#fb923c', '#f97316'], textColor: '#f97316' },
  { icon: 'color-palette', colors: ['#94a3b8', '#64748b'], textColor: '#64748b' },
];

function getCourseTheme(index: number): { icon: keyof typeof Ionicons.glyphMap; colors: [string, string]; textColor: string } {
  return COURSE_THEMES[index % COURSE_THEMES.length] as any;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function UserAvatar({ size = 44 }: { size?: number }) {
  const fireUser = auth.currentUser;
  const photoUrl = fireUser?.photoURL;
  const name = fireUser?.displayName || 'U';
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

function FolderCard({ title, count, index, onPress }: { title: string; count: number; index: number; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { icon, colors } = getCourseTheme(index);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 6, delay: index * 40 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, [title]);

  return (
    <Animated.View style={[styles.folderCardWrapper, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <TouchableOpacity style={[styles.folderCard, Shadow.sm]} onPress={onPress} activeOpacity={0.85}>
        <LinearGradient colors={colors} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.folderIconHeader}>
          <Ionicons name={icon} size={36} color="#fff" style={{ opacity: 0.95 }} />
        </LinearGradient>
        <View style={styles.folderCardBody}>
          <Text style={styles.folderName} numberOfLines={2}>{title}</Text>
          <Text style={styles.folderCount}>{count} {count === 1 ? 'file' : 'files'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <LinearGradient colors={['#FFF0E5', '#FFF8F0']} style={styles.emptyIconBg}>
        <Ionicons name="folder-open-outline" size={36} color={Palette.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptyDesc}>Enroll in courses to access their files and resources here.</Text>
    </View>
  );
}

function GuestState() {
  const router = useRouter();
  return (
    <View style={styles.emptyCard}>
      <LinearGradient colors={['#FFF0E5', '#FFF8F0']} style={styles.emptyIconBg}>
        <Ionicons name="lock-closed-outline" size={36} color={Palette.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Login Required</Text>
      <Text style={styles.emptyDesc}>Please sign in to access your personal study notes and course materials.</Text>
      <TouchableOpacity 
        style={styles.guestBtn}
        onPress={() => router.push('/login')}
        activeOpacity={0.8}
      >
        <Text style={styles.guestBtnText}>Sign In to Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { courses, resourcesMap, loading, loadingMore } = useNotesStore();
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    notesActions.fetchProfileAndCourses();
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
  }, []);

  const fireUser = auth.currentUser;
  const firstName = (fireUser?.displayName || 'Learner').split(' ')[0];

  // Pool resources
  const allLoadedResources: any[] = [];
  Object.values(resourcesMap).forEach(resArray => {
    allLoadedResources.push(...resArray);
  });

  // Count resources per course
  const groupedByCourse: Record<string, number> = {};
  allLoadedResources.forEach(r => {
    const cid = String(r.course_id || '');
    if (cid) {
      groupedByCourse[cid] = (groupedByCourse[cid] || 0) + 1;
    }
  });

  // Create pairs for Grid
  const folderRows = [];
  for (let i = 0; i < courses.length; i += 2) {
    folderRows.push(courses.slice(i, i + 2));
  }

  const renderHeader = () => (
    <View style={{ paddingBottom: Spacing.md }}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your Courses</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
              <Text style={styles.greeting}>{greeting}, {firstName}! 👋</Text>
              <Text style={styles.headerTitle}>Your Notes</Text>
              <Text style={styles.headerSub}>Access your study materials</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile' as any)} activeOpacity={0.8}>
              <UserAvatar size={52} />
            </TouchableOpacity>
          </View>

          {!loading && (
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: `${Palette.primary}15` }]}>
                  <Ionicons name="document-text" size={18} color={Palette.primary} />
                </View>
                <Text style={[styles.statVal, { color: Palette.primary }]}>{allLoadedResources.length}</Text>
                <Text style={styles.statLbl}>Total Files</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: `#8b5cf615` }]}>
                  <Ionicons name="book" size={18} color="#8b5cf6" />
                </View>
                <Text style={[styles.statVal, { color: '#8b5cf6' }]}>{courses.length}</Text>
                <Text style={styles.statLbl}>Courses</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loadingText}>Loading your folders…</Text>
        </View>
      ) : !fireUser ? (
        <View style={styles.scrollContent}>
          <GuestState />
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.scrollContent}>
          <EmptyState />
        </View>
      ) : (
        <FlatList
          data={folderRows}
          keyExtractor={(_, index) => `folder-row-${index}`}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await notesActions.fetchProfileAndCourses(true);
                setRefreshing(false);
              }}
              tintColor={Palette.primary}
              colors={[Palette.primary]}
            />
          }
          ListHeaderComponent={renderHeader}
          onEndReached={() => notesActions.handleLoadMore()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View style={{ paddingBottom: 100, paddingTop: Spacing.xl }}>
              {loadingMore && <ActivityIndicator size="small" color={Palette.primary} style={{ marginBottom: Spacing.xl }} />}
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.gridRow}>
              {item.map((course, idx) => (
                <FolderCard
                  key={course.id || course._id}
                  title={course.title}
                  count={groupedByCourse[String(course.id || course._id)] || course.resource_count || 0}
                  index={(index * 2) + idx}
                  onPress={() => router.push({
                    pathname: '/course-notes/[id]',
                    params: { id: String(course.id || course._id), title: course.title, index: (index * 2) + idx }
                  })}
                />
              ))}
              {item.length === 1 && <View style={styles.folderCardWrapper} />}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },

  // Header
  header: { paddingHorizontal: Spacing.xl, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { ...Typography.small, color: Palette.primary, fontWeight: '700', letterSpacing: 0.3, marginBottom: 2 },
  headerTitle: { ...Typography.h1, color: Palette.textPrimary },
  headerSub: { ...Typography.caption, color: Palette.textSecondary, marginTop: 3 },

  // Stats
  statsStrip: { flexDirection: 'row', gap: 12, marginTop: 16 },
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

  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: { ...Typography.h2, color: Palette.textPrimary },

  // Folder Grid
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  folderCardWrapper: { flex: 1 },
  folderCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Palette.border,
    overflow: 'hidden',
  },
  folderIconHeader: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderCardBody: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  folderName: {
    ...Typography.bodyBold, color: Palette.textPrimary, 
    fontSize: 15, marginBottom: 2,
  },
  folderCount: {
    ...Typography.small, color: Palette.textMuted, fontSize: 12,
  },

  // Empty
  emptyCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['3xl'],
    alignItems: 'center',
    borderWidth: 1, borderColor: Palette.border,
    borderStyle: 'dashed',
    marginTop: Spacing.xl,
  },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.h3, color: Palette.textPrimary, textAlign: 'center' },
  emptyDesc: { ...Typography.body, color: Palette.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  guestBtn: {
    marginTop: 24,
    backgroundColor: Palette.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  guestBtnText: {
    ...Typography.bodyBold,
    color: '#fff',
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { ...Typography.body, color: Palette.textMuted },
});
