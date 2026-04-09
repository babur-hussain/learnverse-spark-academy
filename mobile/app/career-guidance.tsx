import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const TABS = [
  { id: 'aptitude', label: 'Aptitude', icon: 'clipboard' as const },
  { id: 'matches', label: 'Matches', icon: 'people' as const },
  { id: 'roadmap', label: 'Roadmap', icon: 'map' as const },
  { id: 'courses', label: 'Courses', icon: 'book' as const },
];

const CAREER_PATHS = [
  { id: '1', title: 'Engineering', match: 92, icon: 'construct' as const, color: '#3b82f6', skills: ['Mathematics', 'Physics', 'Problem Solving'] },
  { id: '2', title: 'Medicine', match: 85, icon: 'medkit' as const, color: '#ef4444', skills: ['Biology', 'Chemistry', 'Empathy'] },
  { id: '3', title: 'Computer Science', match: 88, icon: 'code-slash' as const, color: '#8b5cf6', skills: ['Logic', 'Programming', 'Creativity'] },
  { id: '4', title: 'Finance', match: 78, icon: 'trending-up' as const, color: '#10b981', skills: ['Mathematics', 'Analytics', 'Communication'] },
  { id: '5', title: 'Design', match: 82, icon: 'color-palette' as const, color: '#f97316', skills: ['Creativity', 'Visual Thinking', 'UX'] },
];

const ROADMAP_STEPS = [
  { step: 1, title: 'Self Assessment', desc: 'Understand your strengths and interests', done: true },
  { step: 2, title: 'Explore Careers', desc: 'Research career options that match your profile', done: true },
  { step: 3, title: 'Skill Building', desc: 'Develop required skills through courses', done: false },
  { step: 4, title: 'Internships', desc: 'Gain practical experience', done: false },
  { step: 5, title: 'Apply', desc: 'Prepare and apply for opportunities', done: false },
];

export default function CareerGuidanceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('aptitude');

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1e293b', '#0f172a'] as any} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Career Guidance</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} activeOpacity={0.8}>
              {activeTab === tab.id ? (
                <LinearGradient colors={Palette.gradientPrimary as any} style={styles.tabPill}>
                  <Ionicons name={tab.icon} size={14} color="#fff" />
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabPillInactive}>
                  <Ionicons name={tab.icon} size={14} color={Palette.textMuted} />
                  <Text style={styles.tabText}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Aptitude Tab */}
        {activeTab === 'aptitude' && (
          <View>
            <View style={[styles.ctaCard, Shadow.md]}>
              <LinearGradient colors={Palette.gradientPrimary as any} style={styles.ctaGradient}>
                <Ionicons name="clipboard" size={40} color="#fff" />
                <Text style={styles.ctaTitle}>Take Career Aptitude Test</Text>
                <Text style={styles.ctaDesc}>Discover your ideal career path based on your interests and skills</Text>
                <TouchableOpacity style={styles.ctaBtn}>
                  <Text style={styles.ctaBtnText}>Start Test</Text>
                  <Ionicons name="arrow-forward" size={16} color={Palette.primary} />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <Text style={styles.sectionTitle}>How It Works</Text>
            {['Answer 25 questions about your interests', 'Get AI-powered career recommendations', 'Follow personalized career roadmap'].map((step, i) => (
              <View key={i} style={[styles.stepRow, Shadow.sm]}>
                <LinearGradient colors={Palette.gradientPrimary as any} style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </LinearGradient>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <View>
            <Text style={styles.sectionTitle}>Your Career Matches</Text>
            {CAREER_PATHS.map(career => (
              <TouchableOpacity key={career.id} style={[styles.matchCard, Shadow.sm]} activeOpacity={0.85}>
                <View style={[styles.matchIcon, { backgroundColor: `${career.color}15` }]}>
                  <Ionicons name={career.icon} size={24} color={career.color} />
                </View>
                <View style={styles.matchContent}>
                  <Text style={styles.matchTitle}>{career.title}</Text>
                  <View style={styles.skillsRow}>
                    {career.skills.map(s => (
                      <View key={s} style={styles.skillBadge}><Text style={styles.skillText}>{s}</Text></View>
                    ))}
                  </View>
                </View>
                <View style={styles.matchPercent}>
                  <Text style={[styles.matchPercentText, { color: career.color }]}>{career.match}%</Text>
                  <Text style={styles.matchPercentLabel}>Match</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <View>
            <Text style={styles.sectionTitle}>Your Career Roadmap</Text>
            {ROADMAP_STEPS.map((step, i) => (
              <View key={step.step} style={styles.roadmapRow}>
                <View style={styles.roadmapTimeline}>
                  <View style={[styles.roadmapDot, step.done && styles.roadmapDotDone]}>
                    {step.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  {i < ROADMAP_STEPS.length - 1 && <View style={[styles.roadmapLine, step.done && styles.roadmapLineDone]} />}
                </View>
                <View style={[styles.roadmapCard, Shadow.sm]}>
                  <Text style={styles.roadmapTitle}>{step.title}</Text>
                  <Text style={styles.roadmapDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <View>
            <Text style={styles.sectionTitle}>Recommended Courses</Text>
            <View style={styles.emptySection}>
              <Ionicons name="school-outline" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>Complete the aptitude test to get personalized course recommendations</Text>
            </View>
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
  tabsRow: { gap: 10 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, gap: 6 },
  tabPillInactive: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Palette.bgCard, borderWidth: 1, borderColor: Palette.border, gap: 6 },
  tabTextActive: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  tabText: { ...Typography.caption, color: Palette.textSecondary },
  scrollContent: { padding: Spacing.xl, paddingBottom: 40 },
  sectionTitle: { ...Typography.h3, color: Palette.textPrimary, marginBottom: Spacing.lg, marginTop: Spacing.xl },
  ctaCard: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGradient: { padding: Spacing['3xl'], alignItems: 'center' },
  ctaTitle: { ...Typography.h2, color: '#fff', marginTop: Spacing.lg, textAlign: 'center' },
  ctaDesc: { ...Typography.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8, marginBottom: Spacing.xl },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md, gap: 8 },
  ctaBtnText: { ...Typography.button, color: Palette.primary },
  stepRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.lg },
  stepNumber: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { ...Typography.bodyBold, color: '#fff', fontSize: 16 },
  stepText: { ...Typography.body, color: Palette.textPrimary, flex: 1 },
  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  matchIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  matchContent: { flex: 1 },
  matchTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 15 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  skillBadge: { backgroundColor: Palette.bgCardElevated, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  skillText: { ...Typography.small, color: Palette.textMuted, fontSize: 10 },
  matchPercent: { alignItems: 'center', marginLeft: 8 },
  matchPercentText: { ...Typography.h2, fontSize: 22 },
  matchPercentLabel: { ...Typography.small, color: Palette.textMuted },
  roadmapRow: { flexDirection: 'row', marginBottom: 4 },
  roadmapTimeline: { width: 32, alignItems: 'center' },
  roadmapDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Palette.bgCardElevated, borderWidth: 2, borderColor: Palette.border, justifyContent: 'center', alignItems: 'center' },
  roadmapDotDone: { backgroundColor: Palette.success, borderColor: Palette.success },
  roadmapLine: { width: 2, flex: 1, backgroundColor: Palette.border },
  roadmapLineDone: { backgroundColor: Palette.success },
  roadmapCard: { flex: 1, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginLeft: Spacing.md, marginBottom: Spacing.md },
  roadmapTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 14 },
  roadmapDesc: { ...Typography.caption, color: Palette.textSecondary, marginTop: 4 },
  emptySection: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyText: { ...Typography.body, color: Palette.textMuted, marginTop: 12, textAlign: 'center' },
});
