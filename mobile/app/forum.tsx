import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const CATEGORIES = [
  { id: '1', name: 'General Discussion', threads: 45, icon: 'chatbubbles' as const, color: '#3b82f6' },
  { id: '2', name: 'Study Tips', threads: 32, icon: 'bulb' as const, color: '#f97316' },
  { id: '3', name: 'Exam Prep', threads: 28, icon: 'school' as const, color: '#8b5cf6' },
  { id: '4', name: 'Career Q&A', threads: 19, icon: 'briefcase' as const, color: '#10b981' },
  { id: '5', name: 'Tech & Coding', threads: 24, icon: 'code-slash' as const, color: '#ec4899' },
];

const THREADS = [
  { id: '1', title: 'Best study techniques for board exams?', author: 'Priya S.', replies: 12, views: 156, time: '2h ago', category: 'Study Tips' },
  { id: '2', title: 'How to prepare for JEE in 6 months', author: 'Rahul K.', replies: 24, views: 342, time: '4h ago', category: 'Exam Prep' },
  { id: '3', title: 'Learning Python - where to start?', author: 'Ankit M.', replies: 8, views: 98, time: '6h ago', category: 'Tech & Coding' },
  { id: '4', title: 'Career options after B.Sc Mathematics', author: 'Neha G.', replies: 15, views: 201, time: '1d ago', category: 'Career Q&A' },
  { id: '5', title: 'Share your daily study schedule', author: 'Vikram S.', replies: 31, views: 445, time: '1d ago', category: 'General Discussion' },
];

export default function ForumScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState<'categories' | 'threads'>('threads');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#0f172a'] as any} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Discussion Forum</Text>
          <TouchableOpacity style={styles.newThreadBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Palette.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search threads..." placeholderTextColor={Palette.textMuted}
            value={search} onChangeText={setSearch} />
        </View>

        {/* View toggle */}
        <View style={styles.viewToggle}>
          {(['threads', 'categories'] as const).map(v => (
            <TouchableOpacity key={v} onPress={() => setActiveView(v)}
              style={[styles.viewTab, activeView === v && styles.viewTabActive]}>
              <Ionicons name={v === 'threads' ? 'list' : 'grid'} size={14} color={activeView === v ? '#fff' : Palette.textMuted} />
              <Text style={[styles.viewTabText, activeView === v && styles.viewTabTextActive]}>
                {v === 'threads' ? 'Threads' : 'Categories'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeView === 'categories' && (
          <>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={[styles.catCard, Shadow.sm]} activeOpacity={0.85}>
                <View style={[styles.catIcon, { backgroundColor: `${cat.color}15` }]}>
                  <Ionicons name={cat.icon} size={22} color={cat.color} />
                </View>
                <View style={styles.catContent}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catThreads}>{cat.threads} threads</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeView === 'threads' && (
          <>
            {THREADS.map(thread => (
              <TouchableOpacity key={thread.id} style={[styles.threadCard, Shadow.sm]} activeOpacity={0.85}>
                <View style={styles.threadHeader}>
                  <View style={styles.threadCatBadge}>
                    <Text style={styles.threadCatText}>{thread.category}</Text>
                  </View>
                  <Text style={styles.threadTime}>{thread.time}</Text>
                </View>
                <Text style={styles.threadTitle}>{thread.title}</Text>
                <View style={styles.threadFooter}>
                  <View style={styles.threadAuthor}>
                    <View style={styles.threadAvatar}>
                      <Text style={styles.threadAvatarText}>{thread.author[0]}</Text>
                    </View>
                    <Text style={styles.threadAuthorName}>{thread.author}</Text>
                  </View>
                  <View style={styles.threadStats}>
                    <View style={styles.threadStat}>
                      <Ionicons name="chatbubble-outline" size={14} color={Palette.textMuted} />
                      <Text style={styles.threadStatText}>{thread.replies}</Text>
                    </View>
                    <View style={styles.threadStat}>
                      <Ionicons name="eye-outline" size={14} color={Palette.textMuted} />
                      <Text style={styles.threadStatText}>{thread.views}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
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
  newThreadBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primary, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCardElevated, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  searchInput: { flex: 1, ...Typography.body, color: Palette.textPrimary, paddingVertical: 10 },
  viewToggle: { flexDirection: 'row', backgroundColor: Palette.bgCardElevated, borderRadius: BorderRadius.lg, padding: 3 },
  viewTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: BorderRadius.md, gap: 6 },
  viewTabActive: { backgroundColor: Palette.primary },
  viewTabText: { ...Typography.caption, color: Palette.textMuted, fontWeight: '600' },
  viewTabTextActive: { color: '#fff' },
  scrollContent: { padding: Spacing.xl },
  catCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  catIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  catContent: { flex: 1 },
  catName: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 15 },
  catThreads: { ...Typography.small, color: Palette.textMuted, marginTop: 2 },
  threadCard: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  threadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  threadCatBadge: { backgroundColor: `${Palette.primary}15`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.sm },
  threadCatText: { ...Typography.small, color: Palette.primary, fontWeight: '600', fontSize: 10 },
  threadTime: { ...Typography.small, color: Palette.textMuted },
  threadTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 15, lineHeight: 22 },
  threadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  threadAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  threadAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.primary, justifyContent: 'center', alignItems: 'center' },
  threadAvatarText: { ...Typography.small, color: '#fff', fontWeight: '700' },
  threadAuthorName: { ...Typography.caption, color: Palette.textSecondary },
  threadStats: { flexDirection: 'row', gap: 12 },
  threadStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  threadStatText: { ...Typography.small, color: Palette.textMuted },
});
