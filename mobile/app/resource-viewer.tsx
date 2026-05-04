import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function ResourceViewerScreen() {
  const router = useRouter();
  const { url, title, type } = useLocalSearchParams<{ url: string; title: string; type: string }>();
  const [loading, setLoading] = useState(true);

  const safeUrl = decodeURIComponent(url || '');
  const safeTitle = decodeURIComponent(title || 'Resource');
  const safeType = decodeURIComponent(type || '').toLowerCase();

  const isVideo = safeType.includes('video') || !!safeUrl.match(/\.(mp4|mov|mkv|webm)$/i);
  const isAudio = safeType.includes('audio') || !!safeUrl.match(/\.(mp3|wav|ogg|m4a)$/i);
  const isImage = safeType.includes('image') || !!safeUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const openDocument = async () => {
    setLoading(false);
    await WebBrowser.openBrowserAsync(safeUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      toolbarColor: '#1e293b',
      controlsColor: '#fff',
    });
  };

  // Auto-open documents when the screen loads
  React.useEffect(() => {
    if (!isVideo && !isAudio && !isImage && safeUrl) {
      openDocument();
    }
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e293b', '#0f172a'] as any} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{safeTitle}</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {(isVideo || isAudio) ? (
          <View style={styles.mediaContainer}>
            <Video
              source={{ uri: safeUrl }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              onReadyForDisplay={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Palette.primary} />
                <Text style={styles.loadingText}>Loading Media...</Text>
              </View>
            )}
          </View>
        ) : isImage ? (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: safeUrl }}
              style={styles.imageViewer}
              contentFit="contain"
              onLoadEnd={() => setLoading(false)}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Palette.primary} />
              </View>
            )}
          </View>
        ) : (
          // Document — opens via WebBrowser sheet, show a tap-to-open UI in the background
          <View style={styles.docContainer}>
            <View style={styles.docCard}>
              <View style={styles.docIconWrap}>
                <Ionicons name="document-text" size={64} color={Palette.primary} />
              </View>
              <Text style={styles.docTitle} numberOfLines={3}>{safeTitle}</Text>
              <Text style={styles.docSubtitle}>Opens in in-app browser</Text>
              <TouchableOpacity style={styles.openBtn} onPress={openDocument} activeOpacity={0.85}>
                <Ionicons name="open-outline" size={18} color="#fff" />
                <Text style={styles.openBtnText}>Open Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  title: {
    ...Typography.bodyBold, color: Palette.textPrimary,
    flex: 1, textAlign: 'center', marginHorizontal: 16,
  },
  content: { flex: 1 },
  mediaContainer: { width: '100%', height: '100%', backgroundColor: '#000', position: 'relative' },
  videoPlayer: { width: '100%', height: '100%' },
  imageViewer: { width: '100%', height: '100%' },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#000',
  },
  loadingText: { ...Typography.small, color: Palette.textMuted, marginTop: 12 },
  docContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Palette.bg, padding: Spacing['2xl'],
  },
  docCard: {
    backgroundColor: Palette.bgCard, borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'], alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: Palette.border,
  },
  docIconWrap: {
    width: 100, height: 100, borderRadius: 24,
    backgroundColor: `${Palette.primary}15`,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl,
  },
  docTitle: {
    ...Typography.h3, color: Palette.textPrimary,
    textAlign: 'center', marginBottom: Spacing.sm,
  },
  docSubtitle: {
    ...Typography.caption, color: Palette.textMuted,
    textAlign: 'center', marginBottom: Spacing['2xl'],
  },
  openBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Palette.primary, paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg,
  },
  openBtnText: { ...Typography.button, color: '#fff' },
});
