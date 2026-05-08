import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Palette, Spacing, Shadow, Typography } from '@/constants/theme';

export default function GamePlayerScreen() {
  const router = useRouter();
  const { gameId, title } = useLocalSearchParams<{ gameId: string; title: string }>();
  const [loading, setLoading] = useState(true);

  const GAME_ASSETS: Record<string, any> = {
    'find-each-other': require('../../public/games/find-each-other/index.html'),
    'keyboard-puzzle': require('../../public/games/keyboard-puzzle/index.html'),
    'letter-jump': require('../../public/games/letter-jump/index.html'),
    'piano': require('../../public/games/piano/index.html'),
  };

  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  React.useEffect(() => {
    async function handleOrientation() {
      if (gameId === 'piano') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
      }
    }
    handleOrientation();

    return () => {
      // Reset to default (portrait as per app.json) when leaving
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [gameId]);

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      setLoading(false);
      return;
    }

    async function loadHtml() {
      try {
        const asset = Asset.fromModule(GAME_ASSETS[gameId]);
        await asset.downloadAsync();
        
        const uri = asset.localUri || asset.uri;
        
        if (uri.startsWith('http')) {
          const response = await fetch(uri);
          const text = await response.text();
          setHtmlContent(text);
        } else {
          const text = await FileSystem.readAsStringAsync(uri);
          setHtmlContent(text);
        }
      } catch (error) {
        console.error("Failed to load html asset", error);
      } finally {
        setLoading(false);
      }
    }
    loadHtml();
  }, [gameId]);

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {/* Floating Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.floatingBackBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {Platform.OS === 'ios' ? (
          <WebView
            source={GAME_ASSETS[gameId]}
            style={styles.webview}
            onLoad={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            originWhitelist={['*']}
          />
        ) : htmlContent ? (
          <WebView
            source={{ html: htmlContent, baseUrl: '' }}
            style={styles.webview}
            onLoad={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            originWhitelist={['*']}
          />
        ) : null}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f472b6" />
            <Text style={styles.loadingText}>Loading Game...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.h3,
    color: '#fff',
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
