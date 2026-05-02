import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import SectionHeader from './SectionHeader';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface FeaturedCategoryItem {
  id: string;
  cta_text?: string;
  category: Category | null;
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

const GRADIENT_COLORS: any[] = [
  ['#3b82f6', '#8b5cf6'],
  ['#10b981', '#06b6d4'],
  ['#f97316', '#f43f5e'],
  ['#8b5cf6', '#ec4899'],
  ['#06b6d4', '#3b82f6'],
  ['#f59e0b', '#ef4444'],
];

const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<FeaturedCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setError(null);
        const res = await api.get('/admin/featured_categories', { 
          params: { order_by: 'created_at', sort: 'asc' },
          signal: controller.signal
        });
        const data = (res.data?.data || res.data || []).filter(
          (item: any) => item?.category?.name
        );
        setCategories(data);
      } catch (e: any) {
        if (e.name !== 'CanceledError') {
          console.error('Error fetching featured categories:', e);
          setError('Failed to load categories.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Explore Categories" subtitle="Discover learning pathways" />
        {[1, 2, 3].map(i => (
          <Shimmer key={i} width="90%" height={80} borderRadius={16} style={{ marginHorizontal: 20, marginBottom: 12 }} />
        ))}
      </View>
    );
  }

  if (error && categories.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title="Explore Categories" subtitle="Discover learning pathways" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color={Palette.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Explore Categories" subtitle="Discover learning pathways" />
      {categories.map((item, index) => {
        if (!item.category) return null;
        const iconName = ICON_MAP[item.category.icon || ''] || 'book';
        const colors = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, Shadow.sm]}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={colors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <Ionicons name={iconName} size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.content}>
              <Text style={styles.name}>{item.category.name}</Text>
              <Text style={styles.description} numberOfLines={1}>
                {item.category.description || 'Explore this category'}
              </Text>
            </View>
            <View style={styles.ctaContainer}>
              <LinearGradient
                colors={colors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaText}>{item.cta_text || 'Explore'}</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  errorContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    backgroundColor: `${Palette.danger}15`,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Palette.danger,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
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
  ctaContainer: {
    marginLeft: Spacing.sm,
  },
  ctaBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  ctaText: {
    ...Typography.small,
    color: '#fff',
    fontWeight: '700',
  },
});

export default FeaturedCategories;
