import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Shadow } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface GameHeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
  onBack?: () => void;
}

export default function GameHeader({ title, rightComponent, onBack }: GameHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={24} color="#334155" />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {rightComponent || <View style={{ width: 40 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 100,
    ...Shadow.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    ...Typography.h3,
    color: '#334155',
    fontWeight: '800',
  },
  rightContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
