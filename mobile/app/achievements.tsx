import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const ALL_ACHIEVEMENTS = [
  { id: 'first_steps', title: 'First Steps', desc: 'Completed your first lesson', icon: 'footsteps', color: Palette.success },
  { id: 'on_fire', title: 'On Fire', desc: '7 day streak', icon: 'flame', color: Palette.warning },
  { id: 'top_scholar', title: 'Top Scholar', desc: 'Scored 100% on a quiz', icon: 'ribbon', color: Palette.purple },
  { id: 'social_butterfly', title: 'Social Butterfly', desc: 'Posted in the Discussion Forum', icon: 'chatbubbles', color: Palette.primary },
  { id: 'night_owl', title: 'Night Owl', desc: 'Studied past midnight', icon: 'moon', color: '#1E1E24' },
];

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
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
        const data = snap.data();
        setUnlockedIds(data.unlockedAchievements || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Achievements</Text>
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
          <Text style={styles.guestDesc}>Please sign in to view your achievements.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {ALL_ACHIEVEMENTS.map((item) => {
            const isUnlocked = unlockedIds.includes(item.id);
            return (
              <View key={item.id} style={[styles.card, isUnlocked ? Shadow.sm : styles.lockedCard]}>
                <View style={[styles.iconContainer, { backgroundColor: isUnlocked ? `${item.color}20` : Palette.bgCardElevated }]}>
                  {isUnlocked ? (
                    <Ionicons name={item.icon as any} size={32} color={item.color} />
                  ) : (
                    <Ionicons name="lock-closed" size={28} color={Palette.textMuted} />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.titleText, !isUnlocked && { color: Palette.textMuted }]}>{item.title}</Text>
                  <Text style={[styles.descText, !isUnlocked && { color: Palette.textMuted }]}>
                    {isUnlocked ? item.desc : 'Keep learning to unlock!'}
                  </Text>
                </View>
                {isUnlocked && <Ionicons name="checkmark-circle" size={24} color={Palette.success} />}
              </View>
            );
          })}
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
  card: { flexDirection: 'row', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, alignItems: 'center' },
  lockedCard: { backgroundColor: Palette.bg, borderWidth: 1, borderColor: Palette.border },
  iconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  textContainer: { flex: 1 },
  titleText: { ...Typography.h3, color: Palette.textPrimary, marginBottom: 4 },
  descText: { ...Typography.body, color: Palette.textSecondary },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  guestTitle: { ...Typography.h2, color: Palette.textPrimary, marginTop: Spacing.lg },
  guestDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', marginTop: 8 },
  signInBtn: { marginTop: Spacing.xl, backgroundColor: Palette.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md },
  signInBtnText: { ...Typography.button, color: '#fff' },
});
