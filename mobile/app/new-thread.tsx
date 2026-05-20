import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = ['General Discussion', 'Study Tips', 'Exam Prep', 'Career Q&A', 'Tech & Coding'];

export default function NewThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign In Required', 'You must be signed in to post a thread.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/login') }
      ]);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'threads'), {
        title: title.trim(),
        content: content.trim(),
        category,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Learner',
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        repliesCount: 0,
        views: 0
      });
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to create thread: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isSubmitting}>
            <Ionicons name="close" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Thread</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} style={styles.postBtn}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={Palette.textMuted}
          value={title}
          onChangeText={setTitle}
          editable={!isSubmitting}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setCategory(cat)}
              disabled={isSubmitting}
              style={[styles.catPill, category === cat && styles.catPillActive]}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your question or discussion topic in detail..."
          placeholderTextColor={Palette.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.h3, color: Palette.textPrimary },
  postBtn: { backgroundColor: Palette.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, minWidth: 64, alignItems: 'center' },
  postBtnText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  scrollContent: { padding: Spacing.xl },
  label: { ...Typography.caption, color: Palette.textSecondary, marginBottom: 8, marginTop: Spacing.md, fontWeight: '600', textTransform: 'uppercase' },
  input: { backgroundColor: Palette.bgCardElevated, borderRadius: BorderRadius.md, padding: Spacing.lg, ...Typography.body, color: Palette.textPrimary, ...Shadow.sm },
  textArea: { minHeight: 150 },
  catRow: { gap: 8, paddingBottom: 8 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Palette.bgCardElevated, borderWidth: 1, borderColor: Palette.border },
  catPillActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  catText: { ...Typography.caption, color: Palette.textSecondary },
  catTextActive: { color: '#fff', fontWeight: '700' }
});
