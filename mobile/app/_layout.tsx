import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from '@/components/ErrorBoundary';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import { SidebarProvider } from '@/components/SidebarContext';
import CustomSidebar from '@/components/CustomSidebar';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some error */
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSplashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []); // Empty deps to prevent multiple subscriptions

  useEffect(() => {
    const checkNavigationState = async () => {
      // Don't route until navigation state is fully mounted and auth initialized
      if (initializing || !navigationState?.key) return;

      const inAuthGroup = segments[0] === 'login';
      const isGuest = await AsyncStorage.getItem('guestMode') === 'true';

      // Enforce authentication routing securely using either standard auth or our custom bypass flag
      if (!user && !isGuest) {
        // Not signed in and not guest - go to login
        if (!inAuthGroup) {
          router.replace('/login');
        }
      } else if (user || isGuest) {
        // Signed in or guest - redirect to tabs ONLY if on login screen
        // This prevents the infinite redirect loop when navigating to other screens
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      }
    };
    
    checkNavigationState();
  }, [user, initializing, segments, navigationState?.key]);

  // If auth is still initializing, only render the splash screen
  if (initializing) {
    return (
      <CustomSplashScreen 
        isAppReady={false} 
        onFinish={() => setSplashAnimationComplete(true)} 
      />
    );
  }

  return (
    <SidebarProvider>
      <ErrorBoundary>
        <View style={{ flex: 1 }}>
          <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="change-password" />
            <Stack.Screen name="catalog/index" />
            <Stack.Screen name="course/[id]" />
            <Stack.Screen name="subject/[id]" />
            <Stack.Screen name="study/[classId]" />
            <Stack.Screen name="kids" />
            <Stack.Screen name="favourites" />
            <Stack.Screen name="explore-features" />
            <Stack.Screen name="career-guidance" />
            <Stack.Screen name="find-school" />
            <Stack.Screen name="forum" />
            <Stack.Screen name="video-library" />
            <Stack.Screen name="stationery" />

            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
        
          {/* Keep splash screen mounted and fading out over the main app */}
          {!isSplashAnimationComplete && (
            <CustomSplashScreen 
              isAppReady={true} 
              onFinish={() => setSplashAnimationComplete(true)} 
            />
          )}

          {/* Render the Custom Sidebar on top of the Stack but below Splash */}
          <CustomSidebar />
        </View>
      </ErrorBoundary>
    </SidebarProvider>
  );
}
