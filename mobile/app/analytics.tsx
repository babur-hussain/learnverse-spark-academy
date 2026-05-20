import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const DEFAULT_STATS = {
  timeSpentHours: 0,
  coursesFinished: 0,
  avgScore: 0,
  dayStreak: 0,
  activityThisWeek: [0, 0, 0, 0, 0, 0, 0], // Mon to Sun
  unlockedAchievements: []
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'stats', 'learning');
    
    // Ensure document exists without overwriting
    setDoc(docRef, {}, { merge: true }).catch(console.error);

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setStats({ ...DEFAULT_STATS, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const maxActivity = Math.max(...stats.activityThisWeek, 1); // Avoid division by zero
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Learning Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Palette.primary} />
        </View>
      ) : !auth.currentUser ? (
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed-outline" size={48} color={Palette.textMuted} />
          <Text style={styles.guestTitle}>Sign in Required</Text>
          <Text style={styles.guestDesc}>Please sign in to view your learning analytics.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, Shadow.sm]}>
              <Ionicons name="time" size={24} color={Palette.primary} />
              <Text style={styles.statValue}>{stats.timeSpentHours}h</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
            <View style={[styles.statCard, Shadow.sm]}>
              <Ionicons name="book" size={24} color={Palette.success} />
              <Text style={styles.statValue}>{stats.coursesFinished}</Text>
              <Text style={styles.statLabel}>Courses Finished</Text>
            </View>
            <View style={[styles.statCard, Shadow.sm]}>
              <Ionicons name="star" size={24} color={Palette.warning} />
              <Text style={styles.statValue}>{stats.avgScore}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={[styles.statCard, Shadow.sm]}>
              <Ionicons name="flame" size={24} color={Palette.danger} />
              <Text style={styles.statValue}>{stats.dayStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={[styles.chartCard, Shadow.sm]}>
            <Text style={styles.chartTitle}>Activity this week (Hours)</Text>
            <View style={styles.chartContainer}>
              {stats.activityThisWeek.map((val, idx) => {
                const heightPercentage = (val / maxActivity) * 100;
                return (
                  <View key={idx} style={styles.barWrapper}>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { height: `${heightPercentage}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{days[idx]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  scrollContent: { padding: Spacing.xl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { width: '48%', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center' },
  statValue: { ...Typography.hero, color: Palette.textPrimary, marginVertical: 8 },
  statLabel: { ...Typography.caption, color: Palette.textSecondary, textAlign: 'center' },
  chartCard: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  chartTitle: { ...Typography.h3, color: Palette.textPrimary, marginBottom: Spacing['2xl'] },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barBg: { width: 16, height: '100%', backgroundColor: Palette.bgCardElevated, borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: Palette.primary, borderRadius: 8 },
  barLabel: { ...Typography.small, color: Palette.textSecondary, marginTop: 8 },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  guestTitle: { ...Typography.h2, color: Palette.textPrimary, marginTop: Spacing.lg },
  guestDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', marginTop: 8 },
  signInBtn: { marginTop: Spacing.xl, backgroundColor: Palette.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md },
  signInBtnText: { ...Typography.button, color: '#fff' },
});
