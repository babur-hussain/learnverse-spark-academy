import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, RefreshControl, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/lib/api';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LiveClass {
  id: string;
  _id?: string;
  title: string;
  teacher_name?: string;
  instructor_name?: string;
  subject?: string;
  start_time?: string;
  scheduled_at?: string;
  status?: 'live' | 'upcoming' | 'ended';
  viewer_count?: number;
  thumbnail_url?: string;
  join_url?: string;
  description?: string;
  duration_minutes?: number;
  course_title?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
}

function getCountdown(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Starting…';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `Starts in ${h}h ${m}m`;
  return `Starts in ${m}m`;
}

function isLive(cls: LiveClass): boolean {
  if (cls.status === 'live') return true;
  if (!cls.start_time && !cls.scheduled_at) return false;
  const start = new Date(cls.start_time || cls.scheduled_at || '').getTime();
  const now = Date.now();
  return now >= start && now <= start + (cls.duration_minutes || 60) * 60000;
}

// ─── Live Pulse Dot ────────────────────────────────────────────────────────────
function PulseDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.8, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 12, height: 12, borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.4)', transform: [{ scale: pulse }]
      }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
    </View>
  );
}

// ─── Live Banner Card ──────────────────────────────────────────────────────────
function LiveBannerCard({ cls, onJoin }: { cls: LiveClass; onJoin: (cls: LiveClass) => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const teacher = cls.teacher_name || cls.instructor_name || 'Instructor';
  const viewers = cls.viewer_count ? `${cls.viewer_count} watching` : 'Live now';

  const pressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: Spacing['2xl'] }}>
      <TouchableOpacity activeOpacity={1} onPressIn={pressIn} onPressOut={pressOut} onPress={() => onJoin(cls)}>
        <LinearGradient
          colors={['#FF6B35', '#e53935']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.liveBanner}
        >
          {/* Decorative circles */}
          <View style={[styles.decCircle, { width: 140, height: 140, top: -50, right: -40, opacity: 0.12 }]} />
          <View style={[styles.decCircle, { width: 80, height: 80, bottom: -30, left: 20, opacity: 0.1 }]} />

          <View style={styles.liveBadge}>
            <PulseDot />
            <Text style={styles.liveBadgeText}>LIVE NOW</Text>
          </View>

          <Text style={styles.liveBannerTitle} numberOfLines={2}>{cls.title}</Text>
          {cls.course_title ? (
            <Text style={styles.liveCourse} numberOfLines={1}>{cls.course_title}</Text>
          ) : null}
          <Text style={styles.liveBannerSub}>{teacher} • {viewers}</Text>

          <TouchableOpacity style={styles.joinBtn} onPress={() => onJoin(cls)} activeOpacity={0.85}>
            <Ionicons name="videocam" size={18} color="#FF6B35" />
            <Text style={styles.joinBtnText}>Join Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Upcoming Card ─────────────────────────────────────────────────────────────
function UpcomingCard({ cls, index }: { cls: LiveClass; index: number }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const teacher = cls.teacher_name || cls.instructor_name || 'Instructor';
  const dateStr = cls.start_time || cls.scheduled_at;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const ICON_COLORS = ['#FF6B35', '#8B5CF6', '#00BFA6', '#EC4899', '#3B82F6', '#F59E0B'];
  const iconColor = ICON_COLORS[index % ICON_COLORS.length];

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      <TouchableOpacity style={[styles.sessionCard, Shadow.md]} activeOpacity={0.85}>
        <View style={[styles.sessionIconWrap, { backgroundColor: `${iconColor}18` }]}>
          <Ionicons name="videocam" size={22} color={iconColor} />
        </View>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle} numberOfLines={1}>{cls.title}</Text>
          <Text style={styles.sessionTeacher} numberOfLines={1}>{teacher}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={12} color={Palette.textMuted} />
            <Text style={styles.sessionTime}>{formatTime(dateStr)}</Text>
            {dateStr && (
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{getCountdown(dateStr)}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={20} color={Palette.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ liveCount, upcomingCount }: { liveCount: number; upcomingCount: number }) {
  return (
    <View style={styles.statsBar}>
      {[
        { icon: 'radio', label: 'Live Now', value: liveCount, color: '#ef4444' },
        { icon: 'calendar', label: 'Upcoming', value: upcomingCount, color: Palette.primary },
      ].map(item => (
        <View key={item.label} style={styles.statItem}>
          <Ionicons name={item.icon as any} size={20} color={item.color} />
          <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ type }: { type: 'live' | 'upcoming' }) {
  return (
    <View style={styles.emptyCard}>
      <LinearGradient colors={['#FFF0E5', '#FFF8F0']} style={styles.emptyIconBg}>
        <Ionicons name={type === 'live' ? 'radio-outline' : 'calendar-outline'} size={36} color={Palette.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {type === 'live' ? 'No Live Classes Right Now' : 'No Upcoming Sessions'}
      </Text>
      <Text style={styles.emptyDesc}>
        {type === 'live'
          ? 'Check back soon! Your instructors will go live soon.'
          : 'Your schedule will populate once your instructors schedule sessions.'}
      </Text>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [allClasses, setAllClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const fetchClasses = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/admin/live_classes');
      const data: LiveClass[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.classes || [];
      setAllClasses(data.map((c: any) => ({ ...c, id: c.id || c._id || String(Math.random()) })));
    } catch {
      // No live classes endpoint yet — show empty gracefully
      setAllClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    // Animate header in
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    // Auto-refresh every 60s to pick up new live classes
    const interval = setInterval(() => fetchClasses(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const liveClasses = allClasses.filter(c => isLive(c));
  const upcomingClasses = allClasses.filter(c => !isLive(c) && c.status !== 'ended');

  const handleJoin = (cls: LiveClass) => {
    if (cls.join_url) {
      router.push({
        pathname: '/resource-viewer' as any,
        params: { url: cls.join_url, title: cls.title, type: 'video' },
      });
    }
  };

  return (
    <View style={[styles.container]}>
      {/* ── Header ── */}
      <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
        <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Live Classes</Text>
              <Text style={styles.headerSub}>Interactive sessions with top educators</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchClasses()}>
              <Ionicons name="refresh" size={20} color={Palette.primary} />
            </TouchableOpacity>
          </View>
          {!loading && <StatsBar liveCount={liveClasses.length} upcomingCount={upcomingClasses.length} />}
        </LinearGradient>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loadingText}>Fetching live classes…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchClasses(true); }}
              tintColor={Palette.primary}
              colors={[Palette.primary]}
            />
          }
        >
          {/* ── Live Now ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLiveRow}>
              <View style={styles.redDot} />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
            {liveClasses.length > 0 && (
              <Text style={styles.sectionCount}>{liveClasses.length} active</Text>
            )}
          </View>

          {liveClasses.length === 0
            ? <EmptyState type="live" />
            : liveClasses.map(cls => (
                <LiveBannerCard key={cls.id} cls={cls} onJoin={handleJoin} />
              ))
          }

          {/* ── Upcoming ── */}
          <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            {upcomingClasses.length > 0 && (
              <Text style={styles.sectionCount}>{upcomingClasses.length} scheduled</Text>
            )}
          </View>

          {upcomingClasses.length === 0
            ? <EmptyState type="upcoming" />
            : upcomingClasses.map((cls, i) => (
                <UpcomingCard key={cls.id} cls={cls} index={i} />
              ))
          }

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
  header: { paddingHorizontal: Spacing.xl, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { ...Typography.h1, color: Palette.textPrimary },
  headerSub: { ...Typography.caption, color: Palette.textSecondary, marginTop: 4 },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${Palette.primary}15`,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },

  // Stats
  statsBar: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    ...Shadow.sm,
  },
  statValue: { ...Typography.bodyBold, fontSize: 16 },
  statLabel: { ...Typography.small, color: Palette.textMuted, flex: 1 },

  // Scroll
  scrollContent: { padding: Spacing.xl, paddingBottom: 100 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.lg,
  },
  sectionLiveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  redDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444',
  },
  sectionTitle: { ...Typography.h3, color: Palette.textPrimary },
  sectionCount: { ...Typography.small, color: Palette.textMuted },

  // Live banner
  liveBanner: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    overflow: 'hidden',
  },
  decCircle: {
    position: 'absolute', borderRadius: 999, backgroundColor: '#fff',
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  liveBadgeText: { ...Typography.small, color: '#fff', fontWeight: '800', letterSpacing: 1.2 },
  liveBannerTitle: { ...Typography.h2, color: '#fff', marginBottom: 4, lineHeight: 30 },
  liveCourse: { ...Typography.small, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  liveBannerSub: { ...Typography.caption, color: 'rgba(255,255,255,0.85)', marginBottom: 20 },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', alignSelf: 'flex-start',
    paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  joinBtnText: { ...Typography.bodyBold, color: '#FF6B35', fontSize: 15 },

  // Upcoming session card
  sessionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Palette.border,
  },
  sessionIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  sessionInfo: { flex: 1 },
  sessionTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 14 },
  sessionTeacher: { ...Typography.caption, color: Palette.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  sessionTime: { ...Typography.small, color: Palette.textMuted },
  countdownBadge: {
    backgroundColor: `${Palette.primary}15`, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4,
  },
  countdownText: { ...Typography.small, color: Palette.primary, fontWeight: '700', fontSize: 10 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${Palette.primary}10`,
    justifyContent: 'center', alignItems: 'center',
  },

  // Empty state
  emptyCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['3xl'],
    alignItems: 'center',
    borderWidth: 1, borderColor: Palette.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.xl,
  },
  emptyIconBg: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { ...Typography.h3, color: Palette.textPrimary, textAlign: 'center' },
  emptyDesc: {
    ...Typography.body, color: Palette.textMuted,
    textAlign: 'center', marginTop: 8, lineHeight: 22,
  },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { ...Typography.body, color: Palette.textMuted },
});
