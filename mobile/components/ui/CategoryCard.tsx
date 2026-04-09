import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  onPress?: () => void;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Code: 'code-slash',
  Calculator: 'calculator',
  Languages: 'language',
  PenTool: 'pencil',
  ChartBar: 'bar-chart',
  Grid3X3: 'grid',
  BookOpen: 'book',
  Sparkles: 'sparkles',
};

const COLOR_MAP: Record<string, readonly [string, string]> = {
  blue: ['#3b82f6', '#2563eb'],
  purple: ['#8b5cf6', '#7c3aed'],
  green: ['#10b981', '#059669'],
  orange: ['#f97316', '#ea580c'],
  pink: ['#ec4899', '#db2777'],
  teal: ['#14b8a6', '#0d9488'],
  red: ['#ef4444', '#dc2626'],
  indigo: ['#6366f1', '#4f46e5'],
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  description,
  icon,
  color,
  onPress,
}) => {
  const iconName = ICON_MAP[icon || ''] || 'book';
  const gradientColors = COLOR_MAP[color || ''] || COLOR_MAP.blue;

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.sm]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={gradientColors as any}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={iconName} size={24} color="#fff" />
        </LinearGradient>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginRight: Spacing.lg,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
  },
  description: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});

export default CategoryCard;
