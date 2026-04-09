import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const KIDS_ITEMS = [
  { id: '1', title: 'Fun Math', description: 'Learn numbers with games!', icon: 'calculator' as const, colors: ['#f472b6', '#a855f7'] },
  { id: '2', title: 'Story Time', description: 'Exciting tales & adventures', icon: 'book' as const, colors: ['#60a5fa', '#34d399'] },
  { id: '3', title: 'Art & Craft', description: 'Create beautiful art', icon: 'color-palette' as const, colors: ['#fbbf24', '#f97316'] },
  { id: '4', title: 'Science Fun', description: 'Cool experiments!', icon: 'flask' as const, colors: ['#818cf8', '#c084fc'] },
  { id: '5', title: 'Music', description: 'Learn rhythm & songs', icon: 'musical-notes' as const, colors: ['#fb923c', '#f43f5e'] },
];

const KidsSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(244, 114, 182, 0.05)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.bgGradient}
      >
        <SectionHeader
          title="Kids Corner 🎨"
          subtitle="Fun learning for young minds"
          actionText="Explore"
          onAction={() => {}}
        />
        <FlatList
          horizontal
          data={KIDS_ITEMS}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, Shadow.sm]} activeOpacity={0.85}>
              <LinearGradient
                colors={item.colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.iconBubble}>
                  <Ionicons name={item.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
  },
  bgGradient: {
    paddingVertical: Spacing['2xl'],
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: 145,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  cardGradient: {
    padding: Spacing.lg,
    height: 170,
    justifyContent: 'center',
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  itemTitle: {
    ...Typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  itemDesc: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
});

export default KidsSection;
