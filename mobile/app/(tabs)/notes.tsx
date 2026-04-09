import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const NOTE_CATEGORIES = [
  { id: '1', title: 'Mathematics', count: 24, icon: 'calculator' as const, color: '#3b82f6' },
  { id: '2', title: 'Physics', count: 18, icon: 'planet' as const, color: '#8b5cf6' },
  { id: '3', title: 'Chemistry', count: 15, icon: 'flask' as const, color: '#10b981' },
  { id: '4', title: 'Biology', count: 20, icon: 'leaf' as const, color: '#f97316' },
  { id: '5', title: 'English', count: 12, icon: 'book' as const, color: '#ec4899' },
  { id: '6', title: 'History', count: 10, icon: 'time' as const, color: '#06b6d4' },
];

const RECENT_NOTES = [
  { id: '1', title: 'Calculus - Integration', subject: 'Mathematics', pages: 24, date: '2 days ago' },
  { id: '2', title: 'Newton\'s Laws', subject: 'Physics', pages: 18, date: '3 days ago' },
  { id: '3', title: 'Organic Chemistry Basics', subject: 'Chemistry', pages: 32, date: '5 days ago' },
];

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Notes</Text>
            <Text style={styles.subtitle}>Study materials & resources</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Ionicons name="download-outline" size={22} color={Palette.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Subjects</Text>
        <View style={styles.categoryGrid}>
          {NOTE_CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.categoryCard, Shadow.sm]} activeOpacity={0.85}>
              <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
                <Ionicons name={cat.icon} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryTitle} numberOfLines={1}>{cat.title}</Text>
              <Text style={styles.categoryCount}>{cat.count} notes</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Notes */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing['2xl'] }]}>Recent Notes</Text>
        {RECENT_NOTES.map(note => (
          <TouchableOpacity key={note.id} style={[styles.noteCard, Shadow.sm]} activeOpacity={0.85}>
            <View style={styles.noteIcon}>
              <Ionicons name="document-text" size={28} color={Palette.primary} />
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteSubject}>{note.subject} • {note.pages} pages</Text>
              <Text style={styles.noteDate}>{note.date}</Text>
            </View>
            <TouchableOpacity style={styles.noteAction}>
              <Ionicons name="ellipsis-vertical" size={20} color={Palette.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Paid Notes CTA */}
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={Palette.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.paidCta}
          >
            <Ionicons name="diamond" size={24} color="#fff" />
            <View style={styles.paidCtaContent}>
              <Text style={styles.paidCtaTitle}>Premium Study Notes</Text>
              <Text style={styles.paidCtaDesc}>Get expert-curated notes with detailed explanations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  downloadBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Palette.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginBottom: Spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryTitle: {
    ...Typography.caption,
    color: Palette.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryCount: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 2,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Palette.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  noteSubject: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  noteDate: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 2,
  },
  noteAction: {
    padding: 8,
  },
  paidCta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  paidCtaContent: {
    flex: 1,
  },
  paidCtaTitle: {
    ...Typography.bodyBold,
    color: '#fff',
  },
  paidCtaDesc: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
