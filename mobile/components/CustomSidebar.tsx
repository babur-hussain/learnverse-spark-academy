import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSidebar } from './SidebarContext';
import { Palette, Shadow, Typography } from '@/constants/theme';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export default function CustomSidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleNavigation = (route: string) => {
    closeSidebar();
    setTimeout(() => {
      router.push(route as any);
    }, 300); // Wait for animation to finish
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('guestMode');
      closeSidebar();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (!isOpen && slideAnim.addListener === undefined) return null; // Avoid rendering when closed if possible, but keep animated value alive

  return (
    <View style={styles.wrapper} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeSidebar}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sidebar Content */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.profileName}>{user?.displayName || 'Student'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Guest User'}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/profile')}>
            <Ionicons name="person-circle-outline" size={24} color={Palette.textPrimary} />
            <Text style={styles.menuText}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/favourites')}>
            <Ionicons name="heart-outline" size={24} color={Palette.textPrimary} />
            <Text style={styles.menuText}>Favourites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/video-library')}>
            <Ionicons name="play-circle-outline" size={24} color={Palette.textPrimary} />
            <Text style={styles.menuText}>Video Library</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/forum')}>
            <Ionicons name="chatbubbles-outline" size={24} color={Palette.textPrimary} />
            <Text style={styles.menuText}>Community Forum</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('/settings')}>
            <Ionicons name="settings-outline" size={24} color={Palette.textPrimary} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999, // Below splash screen, but above everything else
    elevation: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    ...Shadow.lg,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  profileIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    ...Typography.h2,
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body,
    color: Palette.textMuted,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: Palette.textPrimary,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoutText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 16,
  },
});
