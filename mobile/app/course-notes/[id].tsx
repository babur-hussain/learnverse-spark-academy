import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useNotesStore, notesActions, getExt, getFileCategory, Resource } from '@/store/notesStore';
import { resourceManager } from '@/lib/resourceManager';

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

function getCategoryTheme(category: string): { icon: keyof typeof Ionicons.glyphMap; colors: [string, string]; textColor: string } {
  switch (category) {
    case 'Videos': return { icon: 'videocam', colors: ['#a78bfa', '#8b5cf6'], textColor: '#8b5cf6' };
    case 'Audio': return { icon: 'musical-notes', colors: ['#f472b6', '#ec4899'], textColor: '#ec4899' };
    case 'Images': return { icon: 'image', colors: ['#fb923c', '#f97316'], textColor: '#f97316' };
    case 'PDFs': return { icon: 'document-text', colors: ['#f87171', '#ef4444'], textColor: '#ef4444' };
    case 'Documents': return { icon: 'document', colors: ['#60a5fa', '#3b82f6'], textColor: '#3b82f6' };
    case 'Presentations': return { icon: 'easel', colors: ['#fbbf24', '#f59e0b'], textColor: '#f59e0b' };
    case 'Spreadsheets': return { icon: 'grid', colors: ['#34d399', '#10b981'], textColor: '#10b981' };
    default: return { icon: 'file-tray-full', colors: ['#94a3b8', '#64748b'], textColor: '#64748b' };
  }
}

function FolderCard({ category, count, index, onPress }: { category: string; count: number; index: number; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { icon, colors } = getCategoryTheme(category);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 6, delay: index * 40 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, [category]);

  return (
    <Animated.View style={[styles.folderCardWrapper, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <TouchableOpacity style={[styles.folderCard, Shadow.sm]} onPress={onPress} activeOpacity={0.85}>
        <LinearGradient colors={colors} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.folderIconHeader}>
          <Ionicons name={icon} size={36} color="#fff" style={{ opacity: 0.95 }} />
        </LinearGradient>
        <View style={styles.folderCardBody}>
          <Text style={styles.folderName} numberOfLines={1}>{category}</Text>
          <Text style={styles.folderCount}>{count} {count === 1 ? 'file' : 'files'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CourseNotesScreen() {
  const { id, title, index } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { resourcesMap, loadingMore } = useNotesStore();
  const courseId = Array.isArray(id) ? id[0] : id;
  const courseName = Array.isArray(title) ? title[0] : title || 'Course Notes';
  const themeIndex = parseInt(Array.isArray(index) ? index[0] : (index as string) || '0', 10);
  const theme = getCourseTheme(themeIndex);

  const allLoadedResources: Resource[] = [];
  Object.values(resourcesMap).forEach(resArray => {
    allLoadedResources.push(...resArray);
  });

  const courseResources = allLoadedResources.filter(r => String(r.course_id) === String(courseId));

  // Group by File Category
  const groupedByCategory: Record<string, number> = {};
  courseResources.forEach(r => {
    const cat = getFileCategory(getExt(r));
    groupedByCategory[cat] = (groupedByCategory[cat] || 0) + 1;
  });

  const availableCategories = Object.keys(groupedByCategory).sort();

  // Group into rows of 2 for FlatList
  const rows = [];
  for (let i = 0; i < availableCategories.length; i += 2) {
    rows.push(availableCategories.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{courseName}</Text>
            <Text style={styles.headerSub}>{courseResources.length} files available</Text>
          </View>
          <View style={styles.headerIconWrap}>
            <Ionicons name={theme.icon} size={28} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={rows}
        keyExtractor={(_, index) => `row-${index}`}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        onEndReached={() => notesActions.handleLoadMore()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator size="small" color={theme.colors[1]} style={{ marginVertical: 20 }} /> : null
        }
        renderItem={({ item, index }) => (
          <View style={styles.gridRow}>
            {item.map((cat, idx) => (
              <FolderCard
                key={cat}
                category={cat}
                count={groupedByCategory[cat]}
                index={(index * 2) + idx}
                onPress={() => router.push({
                  pathname: '/category/[id]',
                  params: { id: cat, courseId: String(courseId) }
                })}
              />
            ))}
            {item.length === 1 && <View style={styles.folderCardWrapper} />}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Shadow.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { ...Typography.h2, color: '#fff' },
  headerSub: { ...Typography.small, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIconWrap: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
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
});
