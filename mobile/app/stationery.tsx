import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2;

const CATEGORIES = ['All', 'Notebooks', 'Pens', 'Bags', 'Geometry', 'Art Supplies'];

const PRODUCTS = [
  { id: '1', name: 'Premium Notebook Set', price: 299, originalPrice: 499, category: 'Notebooks', rating: 4.5, reviews: 123, img: null },
  { id: '2', name: 'Ball Pen Pack (10)', price: 149, originalPrice: 199, category: 'Pens', rating: 4.2, reviews: 89, img: null },
  { id: '3', name: 'School Backpack', price: 899, originalPrice: 1299, category: 'Bags', rating: 4.7, reviews: 234, img: null },
  { id: '4', name: 'Geometry Box', price: 199, originalPrice: 349, category: 'Geometry', rating: 4.3, reviews: 67, img: null },
  { id: '5', name: 'Watercolor Set', price: 449, originalPrice: 599, category: 'Art Supplies', rating: 4.6, reviews: 156, img: null },
  { id: '6', name: 'A4 Drawing Sheets', price: 179, originalPrice: 249, category: 'Art Supplies', rating: 4.1, reviews: 45, img: null },
];

export default function StationeryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#0f172a'] as any} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Stationery Shop</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Palette.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search products..."
            placeholderTextColor={Palette.textMuted} value={search} onChangeText={setSearch} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} onPress={() => setActiveCategory(c)} activeOpacity={0.8}>
              {activeCategory === c ? (
                <LinearGradient colors={Palette.gradientPrimary as any} style={styles.filterPill}>
                  <Text style={styles.filterPillTextActive}>{c}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterPillInactive}>
                  <Text style={styles.filterPillText}>{c}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {filtered.map(product => {
          const discount = Math.round((1 - product.price / product.originalPrice) * 100);
          return (
            <TouchableOpacity key={product.id} style={[styles.productCard, Shadow.md]} activeOpacity={0.85}>
              <View style={styles.productImageContainer}>
                <LinearGradient
                  colors={['rgba(59,130,246,0.1)', 'rgba(139,92,246,0.1)'] as any}
                  style={styles.productImagePlaceholder}
                >
                  <Ionicons name="cube-outline" size={40} color={Palette.primary} />
                </LinearGradient>
                {discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discount}% OFF</Text>
                  </View>
                )}
              </View>
              <View style={styles.productContent}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                  <Text style={styles.reviewsText}>({product.reviews})</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{product.price}</Text>
                  <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                </View>
                <TouchableOpacity style={styles.addToCartBtn} activeOpacity={0.8}>
                  <Ionicons name="cart" size={14} color="#fff" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40, width: '100%' }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  cartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCardElevated, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  searchInput: { flex: 1, ...Typography.body, color: Palette.textPrimary, paddingVertical: 10 },
  filterRow: { gap: 10, paddingBottom: 4 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full },
  filterPillInactive: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Palette.bgCard, borderWidth: 1, borderColor: Palette.border },
  filterPillTextActive: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  filterPillText: { ...Typography.caption, color: Palette.textSecondary },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 },
  productCard: { width: CARD_WIDTH, backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  productImageContainer: { position: 'relative', width: '100%', height: 140 },
  productImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  discountText: { ...Typography.small, color: '#fff', fontWeight: '800', fontSize: 10 },
  productContent: { padding: Spacing.md },
  productName: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingText: { ...Typography.small, color: '#fbbf24', fontWeight: '700' },
  reviewsText: { ...Typography.small, color: Palette.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  price: { ...Typography.bodyBold, color: Palette.success, fontSize: 16 },
  originalPrice: { ...Typography.caption, color: Palette.textMuted, textDecorationLine: 'line-through' },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary, paddingVertical: 8, borderRadius: BorderRadius.md, marginTop: Spacing.sm, gap: 6 },
  addToCartText: { ...Typography.small, color: '#fff', fontWeight: '700' },
});
