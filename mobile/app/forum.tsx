import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = [
  { id: '1', name: 'General Discussion', threads: 0, icon: 'chatbubbles' as const, color: '#3b82f6' },
  { id: '2', name: 'Study Tips', threads: 0, icon: 'bulb' as const, color: '#f97316' },
  { id: '3', name: 'Exam Prep', threads: 0, icon: 'school' as const, color: '#8b5cf6' },
  { id: '4', name: 'Career Q&A', threads: 0, icon: 'briefcase' as const, color: '#10b981' },
  { id: '5', name: 'Tech & Coding', threads: 0, icon: 'code-slash' as const, color: '#ec4899' },
];

export default function ForumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState<'categories' | 'threads'>('threads');
  
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const handleReportContent = (contentId: string, authorId: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to report content.');
      return;
    }
    Alert.alert(
      'Report Thread',
      'Are you sure you want to report this thread for violating community guidelines?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'reports'), {
                reporterId: user.uid,
                reportedId: contentId,
                reportedAuthorId: authorId,
                contentType: 'thread',
                createdAt: serverTimestamp(),
                status: 'pending'
              });
              Alert.alert('Reported', 'Thank you. Our moderation team will review this content shortly.');
            } catch (e) {
              Alert.alert('Error', 'Failed to submit report.');
            }
          }
        }
      ]
    );
  };

  const handleBlockUser = (authorId: string, authorName: string) => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${authorName}? You will no longer see their threads.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            setBlockedUsers(prev => [...prev, authorId]);
            Alert.alert('Blocked', `${authorName} has been blocked.`);
          }
        }
      ]
    );
  };

  const handleMoreOptions = (contentId: string, authorId: string, authorName: string) => {
    Alert.alert(
      'Options',
      'What would you like to do?',
      [
        { text: 'Report Thread', onPress: () => handleReportContent(contentId, authorId) },
        { text: `Block ${authorName}`, onPress: () => handleBlockUser(authorId, authorName), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  useEffect(() => {
    const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setThreads(fetchedThreads);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching threads:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    return Math.floor(seconds) + 's ago';
  };

  const filteredThreads = threads.filter(t => 
    !blockedUsers.includes(t.authorId) &&
    (t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.category?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Discussion Forum</Text>
          <TouchableOpacity style={styles.newThreadBtn} onPress={() => router.push('/new-thread')}>
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
        {loading ? (
          <ActivityIndicator size="large" color={Palette.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {activeView === 'categories' && (
              <>
                {CATEGORIES.map(cat => {
                  const catThreadsCount = threads.filter(t => t.category === cat.name).length;
                  return (
                    <TouchableOpacity key={cat.id} style={[styles.catCard, Shadow.sm]} activeOpacity={0.85}>
                      <View style={[styles.catIcon, { backgroundColor: `${cat.color}15` }]}>
                        <Ionicons name={cat.icon} size={22} color={cat.color} />
                      </View>
                      <View style={styles.catContent}>
                        <Text style={styles.catName}>{cat.name}</Text>
                        <Text style={styles.catThreads}>{catThreadsCount} threads</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {activeView === 'threads' && (
              <>
                {filteredThreads.length === 0 ? (
                  <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Ionicons name="chatbubbles-outline" size={48} color={Palette.textMuted} />
                    <Text style={{ ...Typography.body, color: Palette.textMuted, marginTop: 12 }}>No threads found</Text>
                  </View>
                ) : (
                  filteredThreads.map(thread => (
                    <TouchableOpacity key={thread.id} style={[styles.threadCard, Shadow.sm]} activeOpacity={0.85} onPress={() => router.push(`/thread/${thread.id}`)}>
                      <View style={styles.threadHeader}>
                        <View style={styles.threadCatBadge}>
                          <Text style={styles.threadCatText}>{thread.category}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.threadTime}>{formatTimeAgo(thread.createdAt)}</Text>
                          <TouchableOpacity onPress={() => handleMoreOptions(thread.id, thread.authorId, thread.authorName)} style={{ marginLeft: 8, padding: 4 }}>
                            <Ionicons name="ellipsis-horizontal" size={16} color={Palette.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.threadTitle} numberOfLines={2}>{thread.title}</Text>
                      <View style={styles.threadFooter}>
                        <View style={styles.threadAuthor}>
                          {thread.authorAvatar ? (
                            <Image source={{ uri: thread.authorAvatar }} style={styles.threadAvatarImage} />
                          ) : (
                            <View style={styles.threadAvatar}>
                              <Text style={styles.threadAvatarText}>{thread.authorName?.[0]?.toUpperCase()}</Text>
                            </View>
                          )}
                          <Text style={styles.threadAuthorName}>{thread.authorName}</Text>
                        </View>
                        <View style={styles.threadStats}>
                          <View style={styles.threadStat}>
                            <Ionicons name="chatbubble-outline" size={14} color={Palette.textMuted} />
                            <Text style={styles.threadStatText}>{thread.repliesCount || 0}</Text>
                          </View>
                          <View style={styles.threadStat}>
                            <Ionicons name="eye-outline" size={14} color={Palette.textMuted} />
                            <Text style={styles.threadStatText}>{thread.views || 0}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
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
  threadAvatarImage: { width: 28, height: 28, borderRadius: 14 },
  threadAvatarText: { ...Typography.small, color: '#fff', fontWeight: '700' },
  threadAuthorName: { ...Typography.caption, color: Palette.textSecondary },
  threadStats: { flexDirection: 'row', gap: 12 },
  threadStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  threadStatText: { ...Typography.small, color: Palette.textMuted },
});
