import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@learnverse_resources_cache';

export interface CachedResource {
  id: string;
  remoteUrl: string;
  localUri: string;
  fileName: string;
  downloadedAt: number;
}

class ResourceManager {
  private cache: Record<string, CachedResource> = {};
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.loadCache();
  }

  private async loadCache() {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load resource cache', e);
    }
  }

  private async saveCache() {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (e) {
      console.error('Failed to save resource cache', e);
    }
  }

  async ensureReady() {
    if (this.initPromise) await this.initPromise;
  }

  /**
   * Check if a resource is already downloaded.
   */
  async isDownloaded(id: string): Promise<boolean> {
    await this.ensureReady();
    const item = this.cache[id];
    if (!item) return false;

    const info = await FileSystem.getInfoAsync(item.localUri);
    if (!info.exists) {
      // Clean up orphaned cache entry
      delete this.cache[id];
      await this.saveCache();
      return false;
    }
    return true;
  }

  /**
   * Get the local URI for a downloaded resource, or null if not downloaded.
   */
  async getLocalUri(id: string): Promise<string | null> {
    if (await this.isDownloaded(id)) {
      return this.cache[id].localUri;
    }
    return null;
  }

  /**
   * Download a resource and save it locally.
   */
  async downloadResource(id: string, url: string, fileName: string, onProgress?: (progress: number) => void): Promise<string> {
    await this.ensureReady();
    
    if (await this.isDownloaded(id)) {
      return this.cache[id].localUri;
    }

    // Ensure safe file name
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const localUri = `${FileSystem.documentDirectory}${id}_${safeFileName}`;

    try {
      const result = await FileSystem.downloadAsync(url, localUri);
      if (result && result.uri) {
        this.cache[id] = {
          id,
          remoteUrl: url,
          localUri: result.uri,
          fileName,
          downloadedAt: Date.now(),
        };
        await this.saveCache();
        return result.uri;
      }
      throw new Error('Download failed: No URI returned');
    } catch (e) {
      console.error('Download error:', e);
      throw e;
    }
  }

  /**
   * Delete a downloaded resource.
   */
  async deleteResource(id: string): Promise<void> {
    await this.ensureReady();
    const item = this.cache[id];
    if (item) {
      try {
        await FileSystem.deleteAsync(item.localUri, { idempotent: true });
      } catch (e) {
        console.error('Failed to delete local file', e);
      }
      delete this.cache[id];
      await this.saveCache();
    }
  }

  /**
   * Clear all cached resources.
   */
  async clearAllCache(): Promise<void> {
    await this.ensureReady();
    for (const key of Object.keys(this.cache)) {
      const item = this.cache[key];
      try {
        await FileSystem.deleteAsync(item.localUri, { idempotent: true });
      } catch (e) {
        console.error('Failed to delete local file during clear', e);
      }
    }
    this.cache = {};
    await this.saveCache();
  }

  /**
   * Get all downloaded resources.
   */
  async getAllDownloads(): Promise<CachedResource[]> {
    await this.ensureReady();
    return Object.values(this.cache).sort((a, b) => b.downloadedAt - a.downloadedAt);
  }
}

export const resourceManager = new ResourceManager();
