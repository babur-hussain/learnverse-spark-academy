import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const MENU_ITEMS = [
  { id: 'favourites', icon: 'heart' as const, label: 'Favourites', color: '#ef4444' },
  { id: 'downloads', icon: 'download' as const, label: 'Downloads', color: '#3b82f6' },
  { id: 'languages', icon: 'globe' as const, label: 'Languages', color: '#10b981' },
  { id: 'subscription', icon: 'card' as const, label: 'Subscription', color: '#f97316' },
  { id: 'notifications', icon: 'notifications' as const, label: 'Notifications', color: '#8b5cf6' },
  { id: 'privacy', icon: 'shield-checkmark' as const, label: 'Privacy', color: '#06b6d4' },
];

const SUPPORT_ITEMS = [
  { id: 'help', icon: 'help-circle' as const, label: 'Help & Support', color: Palette.textMuted },
  { id: 'about', icon: 'information-circle' as const, label: 'About', color: Palette.textMuted },
  { id: 'terms', icon: 'document-text' as const, label: 'Terms of Service', color: Palette.textMuted },
  { id: 'privacy-policy', icon: 'lock-closed' as const, label: 'Privacy Policy', color: Palette.textMuted },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('guestMode');
      router.replace('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(user?.displayName || user?.email || 'G')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'Learner'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Guest User'}</Text>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main menu */}
        <View style={[styles.menuCard, Shadow.sm]}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Support section */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={[styles.menuCard, Shadow.sm]}>
          {SUPPORT_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
              </TouchableOpacity>
              {index < SUPPORT_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutCard, Shadow.sm]} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>LearnVerse v2.3 • Made with ❤️</Text>
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
    paddingBottom: 30,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    ...Typography.h1,
    color: '#fff',
    fontSize: 32,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    ...Typography.h2,
    color: '#fff',
  },
  userEmail: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  editBtn: {
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editBtnText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  menuCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    ...Typography.body,
    color: Palette.textPrimary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginLeft: 64,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    ...Typography.bodyBold,
    color: '#ef4444',
  },
  version: {
    ...Typography.small,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing['2xl'],
  },
});
