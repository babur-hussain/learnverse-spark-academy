import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <Text style={styles.title}>About</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, Shadow.md]}>
            <LinearGradient
              colors={Palette.gradientPrimary as any}
              style={styles.logoGradient}
            >
              <Ionicons name="school" size={48} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>Padhaai Wala</Text>
          <Text style={styles.appVersion}>Version 1.5.1 (Build 9)</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.description}>
            Padhaai Wala is a comprehensive learning platform built to provide top-tier education accessible from anywhere. Our mission is to empower students through engaging interactive content and a supportive community.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="globe-outline" size={20} color={Palette.textMuted} />
            <Text style={styles.rowText}>Website</Text>
            <Text style={styles.rowValue}>padhaaiwala.com</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={20} color={Palette.textMuted} />
            <Text style={styles.rowText}>Contact</Text>
            <Text style={styles.rowValue}>support@padhaaiwala.com</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color={Palette.textMuted} />
            <Text style={styles.rowText}>Headquarters</Text>
            <Text style={styles.rowValue}>New Delhi, India</Text>
          </View>
        </View>
        
        <Text style={styles.copyright}>© 2026 Padhaai Wala. All rights reserved.</Text>
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
  scrollContent: { padding: Spacing.xl },
  logoSection: { alignItems: 'center', marginVertical: Spacing['3xl'] },
  logoContainer: { marginBottom: Spacing.lg },
  logoGradient: { width: 96, height: 96, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  appName: { ...Typography.h1, color: Palette.textPrimary },
  appVersion: { ...Typography.body, color: Palette.textMuted, marginTop: 4 },
  infoSection: { marginBottom: Spacing.xl },
  description: { ...Typography.body, color: Palette.textSecondary, textAlign: 'center', lineHeight: 24 },
  card: { backgroundColor: Palette.bgCard, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Palette.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  rowText: { ...Typography.bodyBold, color: Palette.textPrimary, marginLeft: Spacing.sm, flex: 1 },
  rowValue: { ...Typography.body, color: Palette.textSecondary },
  divider: { height: 1, backgroundColor: Palette.border, marginLeft: 32 },
  copyright: { ...Typography.caption, color: Palette.textMuted, textAlign: 'center', marginTop: Spacing['3xl'] },
});
