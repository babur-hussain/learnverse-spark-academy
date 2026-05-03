import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Shadow } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const currentRouteName = state.routes[state.index].name;
  
  if (currentRouteName === 'ai') return null;


  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          
          // Only show specific tabs
          if (['explore', 'profile'].includes(route.name)) {
            return null;
          }

          const isFocused = state.index === index;
          const isCenter = route.name === 'ai';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: any = 'home';
          if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
          if (route.name === 'courses') iconName = isFocused ? 'book' : 'book-outline';
          if (route.name === 'ai') iconName = 'sparkles';
          if (route.name === 'live') iconName = isFocused ? 'videocam' : 'videocam-outline';
          if (route.name === 'notes') iconName = isFocused ? 'document-text' : 'document-text-outline';

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.centerTabBtn}
                activeOpacity={0.8}
              >
                <View style={[styles.centerTabInner, Shadow.sm]}>
                  <Ionicons name={iconName} size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabBtn}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <Ionicons name={iconName} size={22} color={isFocused ? Palette.primary : Palette.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses' }} />
      <Tabs.Screen name="ai" options={{ title: 'AI Buddy' }} />
      <Tabs.Screen name="live" options={{ title: 'Live' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
      
      {/* Hidden tabs that we moved out or don't want in the bar */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    // The paddingBottom will be applied inline in the component based on insets
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 65,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  activeIconContainer: {
  },
  centerTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35', 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF', 
    marginTop: -25, 
    ...Shadow.md,
  },
});
