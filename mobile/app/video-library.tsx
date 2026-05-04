import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Video {
  _id?: string; id?: string;
  title: string; description?: string;
  thumbnail_url?: string; video_url?: string;
  duration?: string; course_id?: string;
}

export default function VideoLibraryScreen() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'live'>('videos');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/videos');
        setVideos(res.data?.data || res.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#0f172a'] as any} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Video Library</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.tabRow}>
          {(['videos', 'live'] as const).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <Ionicons name={tab === 'videos' ? 'play-circle' : 'radio'} size={16} color={activeTab === tab ? '#fff' : Palette.textMuted} />
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === 'videos' ? 'Course Videos' : 'Live Sessions'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'videos' && (
          <>
            {loading ? (
              [1, 2, 3].map(i => <Shimmer key={i} width="100%" height={200} borderRadius={16} style={{ marginBottom: 16 }} />)
            ) : videos.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="videocam-outline" size={48} color={Palette.textMuted} />
                <Text style={styles.emptyTitle}>No Videos Yet</Text>
                <Text style={styles.emptyDesc}>Course videos will appear here once they're published.</Text>
              </View>
            ) : (
              videos.map(video => (
                <TouchableOpacity key={video._id || video.id} style={[styles.videoCard, Shadow.md]}
                  activeOpacity={0.85} onPress={() => {
                    if (video.video_url) {
                      router.push({
                        pathname: '/resource-viewer' as any,
                        params: { url: video.video_url, title: video.title, type: 'video/mp4' }
                      });
                    }
                  }}>
                  <View style={styles.videoThumbContainer}>
                    <Image
                      source={{ uri: video.thumbnail_url || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=225&fit=crop' }}
                      style={styles.videoThumb} resizeMode="cover"
                    />
                    <View style={styles.playOverlay}>
                      <View style={styles.playBtn}>
                        <Ionicons name="play" size={24} color="#fff" />
                      </View>
                    </View>
                    {video.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{video.duration}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                    {video.description && (
                      <Text style={styles.videoDesc} numberOfLines={2}>{video.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {activeTab === 'live' && (
          <View style={styles.emptySection}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
            <Ionicons name="radio-outline" size={48} color={Palette.textMuted} style={{ marginTop: 16 }} />
            <Text style={styles.emptyTitle}>No Live Sessions</Text>
            <Text style={styles.emptyDesc}>Check back later for upcoming live sessions with educators.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  tabRow: { flexDirection: 'row', backgroundColor: Palette.bgCardElevated, borderRadius: BorderRadius.lg, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: BorderRadius.md, gap: 6 },
  tabActive: { backgroundColor: Palette.primary },
  tabLabel: { ...Typography.caption, color: Palette.textMuted, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  scrollContent: { padding: Spacing.xl },
  videoCard: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  videoThumbContainer: { position: 'relative', width: '100%', height: 200 },
  videoThumb: { width: '100%', height: '100%', backgroundColor: Palette.bgCardElevated },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  durationText: { ...Typography.small, color: '#fff', fontWeight: '600', fontSize: 11 },
  videoInfo: { padding: Spacing.lg },
  videoTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 15 },
  videoDesc: { ...Typography.caption, color: Palette.textSecondary, marginTop: 6 },
  emptySection: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  emptyTitle: { ...Typography.h3, color: Palette.textPrimary, marginTop: Spacing.lg },
  emptyDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', marginTop: 8 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveLabel: { ...Typography.small, color: '#ef4444', fontWeight: '800', letterSpacing: 1 },
});
