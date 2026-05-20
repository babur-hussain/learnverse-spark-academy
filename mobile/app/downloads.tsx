import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { resourceManager, CachedResource } from '@/lib/resourceManager';
import { useIsFocused } from '@react-navigation/native';

function getFileCategoryInfo(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'mov', 'mkv'].includes(ext)) return { icon: 'videocam', color: '#8b5cf6' };
  if (['mp3', 'wav', 'ogg'].includes(ext)) return { icon: 'musical-notes', color: '#ec4899' };
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return { icon: 'image', color: '#f97316' };
  if (['pdf'].includes(ext)) return { icon: 'document-text', color: '#ef4444' };
  if (['doc', 'docx', 'txt'].includes(ext)) return { icon: 'document', color: '#3b82f6' };
  if (['ppt', 'pptx'].includes(ext)) return { icon: 'easel', color: '#f59e0b' };
  if (['xls', 'xlsx'].includes(ext)) return { icon: 'grid', color: '#10b981' };
  return { icon: 'file-tray', color: '#64748b' };
}

export default function DownloadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [downloads, setDownloads] = useState<CachedResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = async () => {
    try {
      const items = await resourceManager.getAllDownloads();
      setDownloads(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchDownloads();
    }
  }, [isFocused]);

  const handleDelete = (id: string, fileName: string) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${fileName}" from your device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await resourceManager.deleteResource(id);
            fetchDownloads();
          }
        }
      ]
    );
  };

  const handleOpen = (item: CachedResource) => {
    router.push({
      pathname: '/resource-viewer' as any,
      params: {
        url: item.localUri,
        remoteUrl: item.remoteUrl,
        title: item.fileName,
        type: item.fileName.split('.').pop() || 'document',
        isLocal: 'true',
      },
    });
  };

  const renderItem = ({ item }: { item: CachedResource }) => {
    const { icon, color } = getFileCategoryInfo(item.fileName);
    const date = new Date(item.downloadedAt).toLocaleDateString();

    return (
      <View style={[styles.card, Shadow.sm]}>
        <TouchableOpacity style={styles.cardMain} onPress={() => handleOpen(item)} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.fileName} numberOfLines={2}>{item.fileName}</Text>
            <Text style={styles.dateText}>Downloaded on {date}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.fileName)}>
          <Ionicons name="trash-outline" size={22} color={Palette.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF5EB', '#FFF8F0']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Downloads</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Palette.primary} />
        </View>
      ) : downloads.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={64} color={Palette.border} />
          <Text style={styles.emptyTitle}>No Downloads</Text>
          <Text style={styles.emptyDesc}>Files you download for offline access will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.bgCardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
  },
  listContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    ...Typography.small,
    color: Palette.textMuted,
  },
  deleteBtn: {
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Palette.textSecondary,
    marginTop: Spacing.md,
  },
  emptyDesc: {
    ...Typography.body,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
