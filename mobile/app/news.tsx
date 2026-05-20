import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';

type NewsArticle = {
  article_id: string;
  title: string;
  description: string;
  link: string;
  source_name: string;
  pubDate: string;
  image_url: string | null;
};

export default function NewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch API key from backend so it's never in the client bundle
      let newsApiKey = '';
      try {
        const configRes = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'https://learnverse.lfvs.in'}/api/config/keys`);
        const configData = await configRes.json();
        newsApiKey = configData.news_api_key;
      } catch {
        newsApiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY || '';
      }
      if (!newsApiKey) {
        throw new Error('Unable to load news configuration.');
      }
      const res = await fetch(`https://newsdata.io/api/1/latest?apikey=${newsApiKey}&country=in&category=education`);
      const data = await res.json();
      if (data.status === 'success') {
        setNews(data.results);
      } else {
        throw new Error(data.results?.message || 'Failed to fetch news');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching news.');
    } finally {
      setLoading(false);
    }
  };

  const openArticle = (url: string, sourceName: string) => {
    router.push(`/news-article?url=${encodeURIComponent(url)}&title=${encodeURIComponent(sourceName)}`);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Latest Educational News</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Palette.primary} />
            <Text style={styles.loadingText}>Fetching live updates...</Text>
          </View>
        )}
        
        {!loading && error && (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Palette.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchNews}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && news.length === 0 && (
          <View style={styles.centerContainer}>
            <Ionicons name="newspaper-outline" size={48} color={Palette.textMuted} />
            <Text style={styles.emptyText}>No news found at the moment.</Text>
          </View>
        )}

        {!loading && !error && news.map((item) => (
          <TouchableOpacity 
            key={item.article_id} 
            style={[styles.card, Shadow.sm]} 
            onPress={() => openArticle(item.link, item.source_name)}
            activeOpacity={0.7}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={[styles.cardImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={32} color={Palette.textMuted} />
              </View>
            )}
            <View style={styles.cardContent}>
              <View style={styles.sourceRow}>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceText} numberOfLines={1}>{item.source_name}</Text>
                </View>
                <Text style={styles.newsDate}>{formatDate(item.pubDate)}</Text>
              </View>
              <Text style={styles.newsTitle} numberOfLines={3}>{item.title}</Text>
              {item.description && (
                <Text style={styles.newsDesc} numberOfLines={2}>{item.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h3, color: Palette.textPrimary },
  scrollContent: { padding: Spacing.xl, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },
  loadingText: { ...Typography.body, color: Palette.textSecondary, marginTop: Spacing.md },
  errorText: { ...Typography.body, color: Palette.danger, marginTop: Spacing.md, textAlign: 'center', paddingHorizontal: Spacing.xl },
  emptyText: { ...Typography.body, color: Palette.textMuted, marginTop: Spacing.md },
  retryBtn: { marginTop: Spacing.lg, backgroundColor: Palette.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.full },
  retryBtnText: { ...Typography.button, color: '#fff' },
  card: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, overflow: 'hidden' },
  cardImage: { width: '100%', height: 180, backgroundColor: Palette.bgCardElevated },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: Spacing.lg },
  sourceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sourceBadge: { backgroundColor: `${Palette.primary}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, maxWidth: '60%' },
  sourceText: { ...Typography.small, color: Palette.primary, fontWeight: '700' },
  newsTitle: { ...Typography.h3, color: Palette.textPrimary, marginBottom: 8, lineHeight: 24 },
  newsDesc: { ...Typography.body, color: Palette.textSecondary, fontSize: 14, lineHeight: 20 },
  newsDate: { ...Typography.caption, color: Palette.textMuted },
});
