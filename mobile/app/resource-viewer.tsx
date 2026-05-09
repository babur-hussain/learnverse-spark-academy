import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Palette, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// File types handled as plain text — fetched and shown as scrollable text
const TEXT_EXTENSIONS = ['srt', 'vtt', 'txt', 'csv', 'md', 'log', 'sub', 'ass'];
// File types sent to Google Docs Viewer
const OFFICE_EXTENSIONS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'odp', 'ods'];

function getExtension(url: string): string {
  return (url.split('?')[0].split('.').pop() || '').toLowerCase();
}

export default function ResourceViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title, type } = useLocalSearchParams<{ url: string; title: string; type: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);

  const safeUrl = decodeURIComponent(url || '');
  const safeTitle = decodeURIComponent(title || 'Resource');
  const safeType = decodeURIComponent(type || '').toLowerCase();
  const ext = getExtension(safeUrl);

  const isVideo = safeType.includes('video') || ['mp4', 'mov', 'mkv', 'webm'].includes(ext);
  const isAudio = safeType.includes('audio') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
  const isImage = safeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  const isPdf = safeType.includes('pdf') || ext === 'pdf';
  const isTextFile = TEXT_EXTENSIONS.includes(ext);
  const isOfficeDoc = OFFICE_EXTENSIONS.includes(ext);

  // Google Docs viewer URL for PDFs and Office docs
  const docsViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(safeUrl)}`;

  // Fetch text-based files and display natively
  useEffect(() => {
    if (!isTextFile || !safeUrl) return;
    setLoading(true);
    fetch(safeUrl)
      .then(r => r.text())
      .then(text => { setTextContent(text); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [safeUrl, isTextFile]);

  const renderContent = () => {
    // ── Images ────────────────────────────────────────────────────
    if (isImage) {
      return (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: safeUrl }}
            style={styles.imageViewer}
            contentFit="contain"
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
          {loading && <LoadingOverlay label="Loading image…" />}
        </View>
      );
    }

    // ── Video / Audio ─────────────────────────────────────────────
    if (isVideo || isAudio) {
      const html = `<!DOCTYPE html>
<html><head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{display:flex;align-items:center;justify-content:center;height:100vh;background:${isVideo ? '#000' : '#f8fafc'}}
    video{max-width:100%;max-height:100vh;outline:none}
    audio{width:90%;margin-top:80px}
  </style>
</head><body>
  ${isVideo
    ? `<video controls autoplay playsinline src="${safeUrl}"></video>`
    : `<audio controls autoplay src="${safeUrl}"></audio>`}
</body></html>`;
      return (
        <View style={styles.mediaContainer}>
          <WebView
            source={{ html }}
            style={styles.webview}
            javaScriptEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['*']}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            // Prevent Android download manager interception
            onShouldStartLoadWithRequest={() => true}
          />
          {loading && <LoadingOverlay label="Loading media…" />}
        </View>
      );
    }

    // ── Text-based files (SRT, TXT, CSV…) ─────────────────────────
    if (isTextFile) {
      if (loading) return <LoadingOverlay label={`Loading ${ext.toUpperCase()} file…`} />;
      if (error || !textContent) return <ErrorView title={safeTitle} url={safeUrl} />;
      return (
        <ScrollView style={styles.textScroll} contentContainerStyle={styles.textContent}>
          <Text style={styles.textBody}>{textContent}</Text>
        </ScrollView>
      );
    }

    // ── PDFs & Office Docs via Google Docs Viewer ─────────────────
    if (isPdf || isOfficeDoc) {
      return (
        <View style={styles.mediaContainer}>
          <WebView
            source={{ uri: docsViewerUrl }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            originWhitelist={['*']}
            // Prevent any download intent from firing
            onShouldStartLoadWithRequest={(req) => {
              // Block anything that's not http/https (e.g. blob: or intent:)
              if (!req.url.startsWith('http')) return false;
              return true;
            }}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            renderLoading={() => <LoadingOverlay label="Loading document…" />}
          />
          {error && <ErrorView title={safeTitle} url={safeUrl} />}
        </View>
      );
    }

    // ── Fallback: Generic WebView for any other URL ───────────────
    return (
      <View style={styles.mediaContainer}>
        <WebView
          source={{ uri: safeUrl }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(req) => {
            if (!req.url.startsWith('http')) return false;
            return true;
          }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          renderLoading={() => <LoadingOverlay label="Loading…" />}
        />
        {error && <ErrorView title={safeTitle} url={safeUrl} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{safeTitle}</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function LoadingOverlay({ label }: { label: string }) {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={Palette.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function ErrorView({ title, url }: { title: string; url: string }) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text style={styles.errorText}>Could not load this file.</Text>
      <Text style={styles.errorSubText} numberOfLines={3}>{url}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    ...Typography.bodyBold,
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: { flex: 1 },
  mediaContainer: { flex: 1, backgroundColor: '#f8fafc', position: 'relative' },
  webview: { flex: 1, backgroundColor: '#f8fafc' },
  imageViewer: { width: '100%', height: '100%' },

  // Text viewer
  textScroll: { flex: 1, backgroundColor: Palette.bg },
  textContent: { padding: 20, paddingBottom: 60 },
  textBody: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 22,
    color: Palette.textPrimary,
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: { ...Typography.small, color: '#94a3b8', marginTop: 12 },

  // Error
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    padding: 24,
  },
  errorText: { ...Typography.bodyBold, color: Palette.textPrimary, marginTop: 16, textAlign: 'center' },
  errorSubText: { ...Typography.small, color: Palette.textMuted, marginTop: 8, textAlign: 'center' },
});
