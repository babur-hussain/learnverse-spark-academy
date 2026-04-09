import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCHOOLS = [
  { id: '1', name: 'Delhi Public School', location: 'New Delhi', type: 'CBSE', rating: 4.5, students: '2500+', img: null },
  { id: '2', name: 'Kendriya Vidyalaya', location: 'Multiple Locations', type: 'CBSE', rating: 4.3, students: '1800+', img: null },
  { id: '3', name: 'Ryan International', location: 'Mumbai', type: 'ICSE', rating: 4.1, students: '1200+', img: null },
  { id: '4', name: 'DAV Public School', location: 'Chandigarh', type: 'CBSE', rating: 4.4, students: '3000+', img: null },
  { id: '5', name: 'St. Xavier\'s School', location: 'Kolkata', type: 'ICSE', rating: 4.6, students: '1500+', img: null },
];

const FILTERS = ['All', 'CBSE', 'ICSE', 'State Board', 'IB'];

export default function FindSchoolScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = SCHOOLS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || s.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#0f172a'] as any} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Find Your School</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>Discover schools near you</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Palette.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search by name or location..."
            placeholderTextColor={Palette.textMuted} value={search} onChangeText={setSearch} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} activeOpacity={0.8}>
              {activeFilter === f ? (
                <LinearGradient colors={Palette.gradientPrimary as any} style={styles.filterPill}>
                  <Text style={styles.filterPillTextActive}>{f}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterPillInactive}>
                  <Text style={styles.filterPillText}>{f}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="search-outline" size={48} color={Palette.textMuted} />
            <Text style={styles.emptyText}>No schools found</Text>
          </View>
        ) : (
          filtered.map(school => (
            <TouchableOpacity key={school.id} style={[styles.schoolCard, Shadow.md]} activeOpacity={0.85}>
              <View style={styles.schoolBanner}>
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6'] as any}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.schoolBannerGradient}
                >
                  <Ionicons name="school" size={36} color="rgba(255,255,255,0.3)" />
                </LinearGradient>
              </View>
              <View style={styles.schoolContent}>
                <View style={styles.schoolHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.schoolName}>{school.name}</Text>
                    <View style={styles.schoolLocation}>
                      <Ionicons name="location-outline" size={14} color={Palette.textMuted} />
                      <Text style={styles.schoolLocationText}>{school.location}</Text>
                    </View>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingText}>{school.rating}</Text>
                  </View>
                </View>
                <View style={styles.schoolTags}>
                  <View style={styles.tag}><Text style={styles.tagText}>{school.type}</Text></View>
                  <View style={styles.tag}><Text style={styles.tagText}>{school.students} students</Text></View>
                </View>
                <TouchableOpacity style={styles.viewDetailsBtn} activeOpacity={0.8}>
                  <Text style={styles.viewDetailsBtnText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={14} color={Palette.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  subtitle: { ...Typography.caption, color: Palette.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: Spacing.lg },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bgCardElevated, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  searchInput: { flex: 1, ...Typography.body, color: Palette.textPrimary, paddingVertical: 10 },
  filterRow: { gap: 10, paddingBottom: 4 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: BorderRadius.full },
  filterPillInactive: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Palette.bgCard, borderWidth: 1, borderColor: Palette.border },
  filterPillTextActive: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  filterPillText: { ...Typography.caption, color: Palette.textSecondary },
  scrollContent: { padding: Spacing.xl },
  schoolCard: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  schoolBanner: { height: 80 },
  schoolBannerGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  schoolContent: { padding: Spacing.lg },
  schoolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  schoolName: { ...Typography.bodyBold, color: Palette.textPrimary, fontSize: 16 },
  schoolLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  schoolLocationText: { ...Typography.caption, color: Palette.textMuted },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, gap: 4 },
  ratingText: { ...Typography.caption, color: '#fbbf24', fontWeight: '700' },
  schoolTags: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  tag: { backgroundColor: Palette.bgCardElevated, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
  tagText: { ...Typography.small, color: Palette.textMuted, fontSize: 11 },
  viewDetailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Palette.primary, gap: 6 },
  viewDetailsBtnText: { ...Typography.button, color: Palette.primary, fontSize: 13 },
  emptySection: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  emptyText: { ...Typography.body, color: Palette.textMuted, marginTop: 12 },
});
