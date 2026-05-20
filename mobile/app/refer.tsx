import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';

export default function ReferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const referralCode = 'SPARK-2026-XQ';

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
      Alert.alert('Copied! ✅', 'Referral code copied to clipboard');
    } catch (e) {
      Alert.alert('Copied!', referralCode);
    }
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: `Join me on Padhaai Wala! Use my referral code ${referralCode} to get 10% off. Download now: https://padhaaiwala.com/download`,
      });
    } catch (e) {
      // User dismissed the share sheet
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF5EB', '#FFF8F0']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Refer & Earn</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="gift" size={80} color={Palette.primary} />
        </View>
        <Text style={styles.heroText}>Invite your friends and earn rewards!</Text>
        <Text style={styles.subText}>Give 10% off and get a free month of Premium for every friend that joins.</Text>

        <View style={[styles.codeCard, Shadow.md]}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={shareReferral}>
          <LinearGradient colors={Palette.gradientPrimary as any} start={{ x:0, y:0 }} end={{ x:1, y:0 }} style={styles.shareGradient}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Share Link</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.bg },
  header: { paddingBottom: 16, paddingHorizontal: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Palette.bgCardElevated, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.h2, color: Palette.textPrimary },
  scrollContent: { padding: Spacing.xl, alignItems: 'center' },
  imagePlaceholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: `${Palette.primary}15`, justifyContent: 'center', alignItems: 'center', marginVertical: Spacing.xl },
  heroText: { ...Typography.h2, color: Palette.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subText: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.lg },
  codeCard: { width: '100%', backgroundColor: Palette.bgCard, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl },
  codeLabel: { ...Typography.caption, color: Palette.textMuted, marginBottom: Spacing.md, textTransform: 'uppercase' },
  codeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Palette.bg, borderRadius: BorderRadius.md, paddingLeft: Spacing.lg, width: '100%', justifyContent: 'space-between', overflow: 'hidden' },
  codeText: { ...Typography.h2, color: Palette.primary, letterSpacing: 2 },
  copyBtn: { backgroundColor: Palette.primary, padding: Spacing.lg },
  shareBtn: { width: '100%', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  shareGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  shareBtnText: { ...Typography.button, color: '#fff' }
});
