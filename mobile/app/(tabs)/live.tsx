import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const UPCOMING_CLASSES = [
  { id: '1', title: 'Mathematics - Calculus', teacher: 'Dr. Sharma', time: 'Today, 4:00 PM', status: 'live' as const },
  { id: '2', title: 'Physics - Mechanics', teacher: 'Prof. Kumar', time: 'Today, 5:30 PM', status: 'upcoming' as const },
  { id: '3', title: 'Chemistry - Organic', teacher: 'Ms. Gupta', time: 'Tomorrow, 10:00 AM', status: 'upcoming' as const },
  { id: '4', title: 'English Literature', teacher: 'Mr. Singh', time: 'Tomorrow, 2:00 PM', status: 'upcoming' as const },
];

export default function LiveScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFF8F0', '#FFF5EB']}
        style={styles.header}
      >
        <Text style={styles.title}>Live Classes</Text>
        <Text style={styles.subtitle}>Join interactive sessions with top educators</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Now Banner */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.liveBanner}
          >
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE NOW</Text>
            </View>
            <Text style={styles.liveBannerTitle}>Mathematics - Calculus</Text>
            <Text style={styles.liveBannerTeacher}>Dr. Sharma • 45 students watching</Text>
            <View style={styles.joinBtn}>
              <Ionicons name="videocam" size={18} color="#ef4444" />
              <Text style={styles.joinBtnText}>Join Now</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Upcoming classes */}
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>

        {UPCOMING_CLASSES.filter(c => c.status === 'upcoming').map(cls => (
          <TouchableOpacity key={cls.id} style={[styles.classCard, Shadow.sm]} activeOpacity={0.85}>
            <View style={styles.classIconContainer}>
              <LinearGradient
                colors={Palette.gradientPrimary as any}
                style={styles.classIcon}
              >
                <Ionicons name="videocam" size={20} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.classContent}>
              <Text style={styles.classTitle}>{cls.title}</Text>
              <Text style={styles.classTeacher}>{cls.teacher}</Text>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color={Palette.textMuted} />
                <Text style={styles.classTime}>{cls.time}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.remindBtn}>
              <Ionicons name="notifications-outline" size={20} color={Palette.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Schedule placeholder */}
        <View style={[styles.scheduleCard, Shadow.sm]}>
          <Ionicons name="calendar-outline" size={48} color={Palette.textMuted} />
          <Text style={styles.scheduleTitle}>Your Weekly Schedule</Text>
          <Text style={styles.scheduleDesc}>Live class schedules will appear here based on your enrolled courses.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  title: {
    ...Typography.h1,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  liveBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    ...Typography.small,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
  },
  liveBannerTitle: {
    ...Typography.h2,
    color: '#fff',
    marginBottom: 4,
  },
  liveBannerTeacher: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.lg,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  joinBtnText: {
    ...Typography.bodyBold,
    color: '#ef4444',
    fontSize: 14,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginBottom: Spacing.lg,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  classIconContainer: {
    marginRight: Spacing.lg,
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classContent: {
    flex: 1,
  },
  classTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  classTeacher: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  classTime: {
    ...Typography.small,
    color: Palette.textMuted,
  },
  remindBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Palette.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing['3xl'],
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderStyle: 'dashed',
  },
  scheduleTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginTop: Spacing.lg,
  },
  scheduleDesc: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
