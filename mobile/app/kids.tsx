import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { Shimmer } from '@/components/ui/LoadingShimmer';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KidsCategory {
  _id?: string; id?: string;
  name: string; slug?: string; description?: string;
  age_group: 'infants' | 'preschool'; icon?: string;
  color_gradient?: string; is_active?: boolean;
}

interface KidsContentItem {
  _id?: string; id?: string; category_id?: string;
  title: string; description?: string;
  content_type?: string; thumbnail_url?: string; content_url?: string;
  duration_minutes?: number; is_featured?: boolean;
}

const AGE_GROUPS = [
  { id: 'infants' as const, title: 'Infants & Toddlers', subtitle: '0-3 years', icon: 'happy' as const, gradient: ['#f472b6', '#a855f7'] },
  { id: 'preschool' as const, title: 'Pre-Schoolers', subtitle: 'Nursery to KG3', icon: 'star' as const, gradient: ['#60a5fa', '#34d399'] },
];

const CONTENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  video: 'videocam', flashcard: 'albums', game: 'game-controller',
  rhyme: 'musical-notes', story: 'book', activity: 'color-palette',
};

export default function KidsScreen() {
  const router = useRouter();
  const [ageGroup, setAgeGroup] = useState<'infants' | 'preschool'>('infants');
  const [categories, setCategories] = useState<KidsCategory[]>([]);
  const [contentItems, setContentItems] = useState<KidsContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [catRes, contentRes] = await Promise.all([
          api.get('/admin/kids_content_categories', { params: { is_active: true } }),
          api.get('/admin/kids_content_items', { params: { is_active: true } }),
        ]);
        setCategories(catRes.data?.data || catRes.data || []);
        setContentItems(contentRes.data?.data || contentRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filteredCats = categories.filter(c => c.age_group === ageGroup);
  const getCatContent = (catId: string) => contentItems.filter(i => i.category_id === catId);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#f472b6', '#a855f7', '#6366f1'] as any} style={styles.hero}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>🧒</Text>
          <Text style={styles.heroTitle}>Kids Learning Zone</Text>
          <Text style={styles.heroSubtitle}>Where learning meets fun and imagination!</Text>
          <View style={styles.heroIcons}>
            <Text style={{ fontSize: 28 }}>❤️</Text>
            <Text style={{ fontSize: 28 }}>⭐</Text>
            <Text style={{ fontSize: 28 }}>✨</Text>
          </View>
        </LinearGradient>

        {/* Age Group Selector */}
        <View style={styles.ageGroupRow}>
          {AGE_GROUPS.map(g => (
            <TouchableOpacity key={g.id} onPress={() => setAgeGroup(g.id)} activeOpacity={0.85}
              style={[styles.ageCard, ageGroup === g.id && styles.ageCardActive, Shadow.md]}>
              <LinearGradient colors={g.gradient as any} style={styles.ageCardGradient}>
                <Ionicons name={g.icon} size={28} color="#fff" />
                <Text style={styles.ageCardTitle}>{g.title}</Text>
                <Text style={styles.ageCardSub}>{g.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {ageGroup === 'infants' ? 'Infants & Toddlers' : 'Pre-Schoolers'} Learning Center
          </Text>

          {loading ? (
            [1, 2, 3].map(i => <Shimmer key={i} width="100%" height={120} borderRadius={16} style={{ marginBottom: 12 }} />)
          ) : filteredCats.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="sparkles" size={48} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No categories available yet</Text>
            </View>
          ) : (
            filteredCats.map((cat, idx) => {
              const catContent = getCatContent(cat._id || cat.id || '');
              const isExpanded = selectedCat === (cat._id || cat.id);
              return (
                <View key={cat._id || cat.id} style={{ marginBottom: Spacing.lg }}>
                  <TouchableOpacity
                    style={[styles.catCard, Shadow.sm]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedCat(isExpanded ? null : (cat._id || cat.id || null))}
                  >
                    <View style={[styles.catIcon, { backgroundColor: `${['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'][idx % 5]}25` }]}>
                      <Ionicons name={CONTENT_ICONS[cat.icon || 'book'] || 'book'} size={24}
                        color={['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'][idx % 5]} />
                    </View>
                    <View style={styles.catContent}>
                      <Text style={styles.catTitle}>{cat.name}</Text>
                      {cat.description && <Text style={styles.catDesc} numberOfLines={2}>{cat.description}</Text>}
                      <Text style={styles.catMeta}>{catContent.length} items</Text>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Palette.textMuted} />
                  </TouchableOpacity>

                  {/* Expanded content */}
                  {isExpanded && (
                    <View style={styles.contentGrid}>
                      {catContent.length === 0 ? (
                        <Text style={styles.emptyText}>No content yet. Check back soon!</Text>
                      ) : (
                        catContent.map(item => (
                          <TouchableOpacity key={item._id || item.id} style={[styles.contentCard, Shadow.sm]}
                            onPress={() => item.content_url && Linking.openURL(item.content_url)} activeOpacity={0.85}>
                            {item.thumbnail_url ? (
                              <Image source={{ uri: item.thumbnail_url }} style={styles.contentThumb} resizeMode="cover" />
                            ) : (
                              <View style={[styles.contentThumb, styles.contentThumbPlaceholder]}>
                                <Ionicons name={CONTENT_ICONS[item.content_type || 'activity'] || 'play'} size={28} color={Palette.primary} />
                              </View>
                            )}
                            <View style={styles.contentInfo}>
                              <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
                              {item.content_type && (
                                <View style={styles.contentBadge}>
                                  <Text style={styles.contentBadgeText}>{item.content_type}</Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Features Bar */}
        <View style={styles.featuresBar}>
          {[
            { icon: 'shield-checkmark' as const, label: 'Safe & Secure', color: '#10b981' },
            { icon: 'volume-high' as const, label: 'Audio Learning', color: '#3b82f6' },
            { icon: 'color-palette' as const, label: 'Visual Arts', color: '#8b5cf6' },
            { icon: 'download' as const, label: 'Offline', color: '#f97316' },
          ].map(f => (
            <View key={f.label} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${f.color}15` }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Parental Controls */}
        <View style={[styles.parentCard, Shadow.sm]}>
          <Text style={styles.parentEmoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.parentTitle}>Parental Controls Available</Text>
          <Text style={styles.parentDesc}>Monitor progress, set screen time limits, and create a safe learning environment</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  hero: { paddingTop: 56, paddingBottom: 30, paddingHorizontal: Spacing.xl, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 52, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { ...Typography.hero, color: '#fff', fontSize: 28, textAlign: 'center' },
  heroSubtitle: { ...Typography.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 8 },
  heroIcons: { flexDirection: 'row', gap: 16, marginTop: 16 },
  ageGroupRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, marginTop: -20, gap: Spacing.md },
  ageCard: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ageCardActive: { borderWidth: 2, borderColor: '#fff' },
  ageCardGradient: { padding: Spacing.lg, alignItems: 'center', height: 120, justifyContent: 'center' },
  ageCardTitle: { ...Typography.bodyBold, color: '#fff', fontSize: 13, textAlign: 'center', marginTop: 8 },
  ageCardSub: { ...Typography.small, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },
  sectionTitle: { ...Typography.h2, color: Palette.textPrimary, marginBottom: Spacing.lg },
  catCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  catIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  catContent: { flex: 1 },
  catTitle: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 15 },
  catDesc: { ...Typography.caption, color: Palette.textSecondary, marginTop: 2 },
  catMeta: { ...Typography.small, color: Palette.textMuted, marginTop: 4 },
  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, paddingTop: Spacing.md, paddingLeft: Spacing.md },
  contentCard: { width: (SCREEN_WIDTH - 72) / 2, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  contentThumb: { width: '100%', height: 90, backgroundColor: Palette.bgCardElevated },
  contentThumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  contentInfo: { padding: Spacing.md },
  contentTitle: { ...Typography.caption, color: Palette.textPrimary, fontWeight: '600' },
  contentBadge: { alignSelf: 'flex-start', backgroundColor: Palette.bgCardElevated, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, marginTop: 4 },
  contentBadgeText: { ...Typography.small, color: Palette.textMuted, fontSize: 10, textTransform: 'uppercase' },
  emptySection: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyText: { ...Typography.body, color: Palette.textMuted, marginTop: 12, textAlign: 'center' },
  featuresBar: { flexDirection: 'row', marginHorizontal: Spacing.xl, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginTop: Spacing['2xl'] },
  featureItem: { flex: 1, alignItems: 'center' },
  featureIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  featureLabel: { ...Typography.small, color: Palette.textMuted, textAlign: 'center', fontSize: 10 },
  parentCard: { marginHorizontal: Spacing.xl, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing['2xl'], alignItems: 'center', marginTop: Spacing.xl, borderWidth: 1, borderColor: Palette.border },
  parentEmoji: { fontSize: 36, marginBottom: 8 },
  parentTitle: { ...Typography.h3, color: Palette.textPrimary },
  parentDesc: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', marginTop: 6 },
});
