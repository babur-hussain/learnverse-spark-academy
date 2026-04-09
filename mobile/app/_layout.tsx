import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  useEffect(() => {
    const checkNavigationState = async () => {
      if (initializing) return;

      const inTabsGroup = segments[0] === '(tabs)';
      const isGuest = await AsyncStorage.getItem('guestMode') === 'true';

      // Enforce authentication routing securely using either standard auth or our custom bypass flag
      if (!user && !isGuest && (inTabsGroup || (segments.length as number) === 0)) {
        router.replace('/login');
      } else if ((user || isGuest) && !inTabsGroup) {
        router.replace('/(tabs)');
      }
    };
    
    checkNavigationState();
  }, [user, initializing, segments]);

  if (initializing) return null; // Or a loading splash screen

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
