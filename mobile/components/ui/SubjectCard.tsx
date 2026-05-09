import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
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
        source={{ uri: thumbnailUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=512&h=512&fit=crop' }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
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
});

export default SubjectCard;
