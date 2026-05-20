import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [thread, setThread] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const handleReportContent = (contentId: string, authorId: string, contentType: 'thread' | 'comment') => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to report content.');
      return;
    }
    Alert.alert(
      'Report Content',
      'Are you sure you want to report this content for violating community guidelines?',
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
                contentType,
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
      `Are you sure you want to block ${authorName}? You will no longer see their content.`,
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

  const handleMoreOptions = (contentId: string, authorId: string, authorName: string, contentType: 'thread' | 'comment') => {
    Alert.alert(
      'Options',
      'What would you like to do?',
      [
        { text: 'Report Content', onPress: () => handleReportContent(contentId, authorId, contentType) },
        { text: `Block ${authorName}`, onPress: () => handleBlockUser(authorId, authorName), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  useEffect(() => {
    if (!id) return;

    const fetchThread = async () => {
      try {
        const docRef = doc(db, 'threads', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setThread({ id: docSnap.id, ...docSnap.data() });
          // Increment views
          await updateDoc(docRef, { views: increment(1) });
        } else {
          Alert.alert('Error', 'Thread not found');
          router.back();
        }
      } catch (error) {
        console.error("Error fetching thread:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchThread();

    const commentsQuery = query(
      collection(db, 'comments'),
      where('threadId', '==', id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to reply.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') }
      ]);
      return;
    }

    setIsReplying(true);
    try {
      await addDoc(collection(db, 'comments'), {
        threadId: id,
        content: replyText.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Learner',
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp()
      });

      // Update thread replies count
      await updateDoc(doc(db, 'threads', id as string), {
        repliesCount: increment(1)
      });

      setReplyText('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to post reply: ' + error.message);
    } finally {
      setIsReplying(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  if (!thread || blockedUsers.includes(thread.authorId)) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyCommentsText}>This content is not available or has been blocked.</Text>
      </View>
    );
  }

  const visibleComments = comments.filter(c => !blockedUsers.includes(c.authorId));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{thread.category}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Thread */}
        <View style={styles.threadCard}>
          <Text style={styles.title}>{thread.title}</Text>
          <View style={styles.authorRow}>
            {thread.authorAvatar ? (
              <Image source={{ uri: thread.authorAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{thread.authorName?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={styles.authorName}>{thread.authorName}</Text>
              <Text style={styles.timeText}>{formatTime(thread.createdAt)}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => handleMoreOptions(thread.id, thread.authorId, thread.authorName, 'thread')} style={{ padding: 4 }}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Palette.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.threadBody}>{thread.content}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color={Palette.textMuted} />
              <Text style={styles.statText}>{thread.repliesCount || 0} Replies</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color={Palette.textMuted} />
              <Text style={styles.statText}>{thread.views || 0} Views</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Comments */}
        <Text style={styles.commentsHeader}>Replies ({visibleComments.length})</Text>
        {visibleComments.map((comment, index) => (
          <View key={comment.id} style={[styles.commentCard, index === visibleComments.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.authorRow}>
              {comment.authorAvatar ? (
                <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatar} />
              ) : (
                <View style={styles.commentAvatarPlaceholder}>
                  <Text style={styles.commentAvatarText}>{comment.authorName?.[0]?.toUpperCase()}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.commentMeta}>
                  <Text style={styles.authorName}>{comment.authorName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.timeText}>{formatTime(comment.createdAt)}</Text>
                    <TouchableOpacity onPress={() => handleMoreOptions(comment.id, comment.authorId, comment.authorName, 'comment')} style={{ marginLeft: 8 }}>
                      <Ionicons name="ellipsis-horizontal" size={16} color={Palette.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.commentBody}>{comment.content}</Text>
              </View>
            </View>
          </View>
        ))}
        {visibleComments.length === 0 && (
          <View style={styles.emptyComments}>
            <Ionicons name="chatbubbles-outline" size={32} color={Palette.textMuted} />
            <Text style={styles.emptyCommentsText}>Be the first to reply!</Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Input */}
      <View style={[styles.replyContainer, { paddingBottom: insets.bottom || 16 }]}>
        <TextInput
          style={styles.replyInput}
          placeholder="Write a reply..."
          placeholderTextColor={Palette.textMuted}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]} 
          onPress={handleReply}
          disabled={!replyText.trim() || isReplying}
        >
          {isReplying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.h3, color: Palette.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 16 },
  scrollContent: { paddingBottom: 40 },
  threadCard: { padding: Spacing.xl, backgroundColor: Palette.bg },
  title: { ...Typography.h2, color: Palette.textPrimary, marginBottom: Spacing.lg },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: Spacing.md },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { ...Typography.bodyBold, color: '#fff' },
  authorName: { ...Typography.bodyBold, color: Palette.textPrimary },
  timeText: { ...Typography.caption, color: Palette.textMuted, marginTop: 2 },
  threadBody: { ...Typography.body, color: Palette.textSecondary, lineHeight: 24, marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { ...Typography.small, color: Palette.textMuted },
  divider: { height: 8, backgroundColor: Palette.bgCardElevated },
  commentsHeader: { ...Typography.h3, color: Palette.textPrimary, padding: Spacing.xl, paddingBottom: 8 },
  commentCard: { padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Palette.border },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: Spacing.md },
  commentAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: Palette.textMuted, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  commentAvatarText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  commentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentBody: { ...Typography.body, color: Palette.textSecondary, lineHeight: 22 },
  emptyComments: { padding: Spacing['3xl'], alignItems: 'center' },
  emptyCommentsText: { ...Typography.body, color: Palette.textMuted, marginTop: 8 },
  replyContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.md, backgroundColor: Palette.bgCard, borderTopWidth: 1, borderTopColor: Palette.border },
  replyInput: { flex: 1, backgroundColor: Palette.bg, borderRadius: BorderRadius.md, padding: 12, paddingTop: 12, paddingRight: 40, ...Typography.body, color: Palette.textPrimary, minHeight: 44, maxHeight: 120 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: Palette.border }
});
