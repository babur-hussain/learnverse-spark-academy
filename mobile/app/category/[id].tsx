import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useNotesStore, notesActions, getExt, getFileCategory, Resource } from '@/store/notesStore';
import { resourceManager } from '@/lib/resourceManager';

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

function GridResourceCard({ resource, index, onOpen }: { resource: Resource; index: number; onOpen: (r: Resource, localUri: string | null) => void }) {
  const [isOffline, setIsOffline] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const ext = getExt(resource);
  const category = getFileCategory(ext);
  const { icon, colors } = getCategoryTheme(category);
  
  const name = resource.title || resource.name || 'Untitled';
  const rId = resource.id || resource._id || '';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 6, delay: Math.min(index * 30, 200) }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, delay: Math.min(index * 30, 200), useNativeDriver: true }),
    ]).start();

    if (rId) {
      resourceManager.isDownloaded(rId).then(setIsOffline);
    }
  }, [rId]);

  const handlePress = async () => {
    if (isDownloading) return;
    
    if (isOffline) {
      const localUri = await resourceManager.getLocalUri(rId);
      onOpen(resource, localUri);
    } else {
      if (!resource.url) return;
      setIsDownloading(true);
      try {
        const localUri = await resourceManager.downloadResource(rId, resource.url, name);
        setIsOffline(true);
        onOpen(resource, localUri);
      } catch (err) {
        console.error('Download failed', err);
        onOpen(resource, null);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <Animated.View style={[styles.gridCardWrapper, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <TouchableOpacity style={[styles.gridCard, Shadow.sm]} onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient colors={colors} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.gridIconHeader}>
          <Ionicons name={icon} size={32} color="#fff" style={{ opacity: 0.9 }} />
          <View style={styles.gridActionWrap}>
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isOffline ? (
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            ) : (
              <Ionicons name="cloud-download-outline" size={20} color="rgba(255,255,255,0.8)" />
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.gridCardBody}>
          <Text style={styles.gridCardName} numberOfLines={2}>{name}</Text>
          <Text style={styles.gridCardCourse} numberOfLines={1}>{resource.course_title || 'Unknown Course'}</Text>
          <Text style={styles.gridCardExt}>{ext ? ext.toUpperCase() : 'FILE'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CategoryScreen() {
  const { id, courseId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { resourcesMap, loadingMore } = useNotesStore();
  const categoryName = Array.isArray(id) ? id[0] : id;
  const cId = Array.isArray(courseId) ? courseId[0] : courseId;
  const theme = getCategoryTheme(categoryName || 'Other Files');

  const allLoadedResources: Resource[] = [];
  Object.values(resourcesMap).forEach(resArray => {
    allLoadedResources.push(...resArray);
  });

  let categoryResources = allLoadedResources.filter(r => getFileCategory(getExt(r)) === categoryName);
  
  if (cId) {
    categoryResources = categoryResources.filter(r => String(r.course_id) === String(cId));
  }

  // Group into rows of 2 for FlatList
  const rows = [];
  for (let i = 0; i < categoryResources.length; i += 2) {
    rows.push(categoryResources.slice(i, i + 2));
  }

  const handleOpen = (r: Resource, localUri: string | null) => {
    const urlToOpen = localUri || r.url;
    if (!urlToOpen) return;
    router.push({
      pathname: '/resource-viewer' as any,
      params: {
        url: urlToOpen,
        remoteUrl: r.url || '',
        title: r.title || r.name || 'File',
        type: r.mime_type || r.type || getExt(r),
        isLocal: localUri ? 'true' : 'false',
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{categoryName}</Text>
            <Text style={styles.headerSub}>{categoryResources.length} files available</Text>
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
            {item.map((res, idx) => (
              <GridResourceCard 
                key={res.id || idx} 
                resource={res} 
                index={(index * 2) + idx} 
                onOpen={handleOpen} 
              />
            ))}
            {item.length === 1 && <View style={styles.gridCardWrapper} />}
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
  gridCardWrapper: { flex: 1 },
  gridCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Palette.border,
    overflow: 'hidden',
  },
  gridIconHeader: {
    height: 70, justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  gridActionWrap: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12, width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  gridCardBody: { padding: Spacing.md },
  gridCardName: {
    ...Typography.bodyBold, color: Palette.textPrimary, 
    fontSize: 13, lineHeight: 18, marginBottom: 4, height: 36,
  },
  gridCardCourse: {
    ...Typography.small, color: Palette.textMuted, fontSize: 11, marginBottom: 6,
  },
  gridCardExt: {
    ...Typography.caption, color: Palette.textSecondary, 
    fontWeight: '800', backgroundColor: Palette.bg,
    alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, overflow: 'hidden',
  },
});
