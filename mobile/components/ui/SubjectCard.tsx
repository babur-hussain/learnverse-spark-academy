import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SubjectCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  chaptersCount?: number;
  onPress?: () => void;
  width?: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  title,
  thumbnailUrl,
  chaptersCount,
  onPress,
  width,
}) => {
  const cardWidth = width || (SCREEN_WIDTH - 56) / 2;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }, Shadow.sm]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: thumbnailUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=120&fit=crop' }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
        style={styles.overlay}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {chaptersCount !== undefined && (
          <Text style={styles.chapters}>{chaptersCount} chapters</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.bgCard,
    marginRight: Spacing.md,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.bgCardElevated,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
  },
  chapters: {
    ...Typography.small,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});

export default SubjectCard;
