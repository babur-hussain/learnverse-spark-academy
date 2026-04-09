import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  instructor?: string;
  onPress?: () => void;
  compact?: boolean;
  width?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  thumbnailUrl,
  price,
  instructor,
  onPress,
  compact = false,
  width,
}) => {
  const cardWidth = width || (compact ? SCREEN_WIDTH * 0.7 : SCREEN_WIDTH - 40);

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }, compact && styles.cardCompact, Shadow.md]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.imageContainer, compact && styles.imageCompact]}>
        <Image
          source={{ uri: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop' }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
          style={styles.imageOverlay}
        />
        {price !== undefined && (
          <View style={[styles.priceBadge, price === 0 && styles.freeBadge]}>
            <Text style={styles.priceText}>
              {price > 0 ? `₹${price}` : 'FREE'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {description && !compact && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
        <View style={styles.footer}>
          {instructor && (
            <Text style={styles.instructor} numberOfLines={1}>by {instructor}</Text>
          )}
          <View style={styles.exploreBtn}>
            <LinearGradient
              colors={Palette.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreBtnGradient}
            >
              <Text style={styles.exploreBtnText}>Explore</Text>
            </LinearGradient>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.lg,
  },
  cardCompact: {
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  imageCompact: {
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Palette.bgCardElevated,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  freeBadge: {
    backgroundColor: Palette.success,
  },
  priceText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  description: {
    ...Typography.body,
    color: Palette.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  instructor: {
    ...Typography.caption,
    color: Palette.textMuted,
    flex: 1,
  },
  exploreBtn: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  exploreBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  exploreBtnText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
});

export default CourseCard;
