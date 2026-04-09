import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

interface SettingToggle {
  id: string;
  label: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  defaultValue: boolean;
}

const NOTIFICATION_SETTINGS: SettingToggle[] = [
  { id: 'email', label: 'Email Notifications', description: 'Course updates & announcements', icon: 'mail', color: Palette.primary, defaultValue: true },
  { id: 'push', label: 'Push Notifications', description: 'Real-time alerts on your device', icon: 'notifications', color: Palette.warning, defaultValue: true },
  { id: 'live', label: 'Live Class Reminders', description: 'Get notified before classes start', icon: 'videocam', color: Palette.danger, defaultValue: true },
  { id: 'promo', label: 'Promotions & Offers', description: 'Course discounts and deals', icon: 'pricetag', color: Palette.success, defaultValue: false },
];

const PRIVACY_SETTINGS: SettingToggle[] = [
  { id: 'profile_visible', label: 'Profile Visibility', description: 'Let others see your profile', icon: 'eye', color: Palette.primary, defaultValue: true },
  { id: 'show_progress', label: 'Show Learning Progress', description: 'Display course progress publicly', icon: 'bar-chart', color: Palette.success, defaultValue: false },
  { id: 'analytics', label: 'Usage Analytics', description: 'Help us improve with anonymous data', icon: 'analytics', color: Palette.info, defaultValue: true },
];

const APPEARANCE_SETTINGS: SettingToggle[] = [
  { id: 'dark_mode', label: 'Dark Mode', description: 'Use dark theme throughout the app', icon: 'moon', color: Palette.purple, defaultValue: true },
  { id: 'reduce_motion', label: 'Reduce Motion', description: 'Minimize animations', icon: 'flash-off', color: Palette.warning, defaultValue: false },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    [...NOTIFICATION_SETTINGS, ...PRIVACY_SETTINGS, ...APPEARANCE_SETTINGS].forEach(s => {
      initial[s.id] = s.defaultValue;
    });
    return initial;
  });

  const handleToggle = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderToggleSection = (title: string, items: SettingToggle[]) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={[styles.settingsCard, Shadow.sm]}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingDesc}>{item.description}</Text>
                )}
              </View>
              <Switch
                value={toggles[item.id]}
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: Palette.bgCardElevated, true: `${item.color}60` }}
                thumbColor={toggles[item.id] ? item.color : '#94a3b8'}
                ios_backgroundColor={Palette.bgCardElevated}
              />
            </View>
            {index < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1e293b', '#0f172a'] as any}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={[styles.settingsCard, Shadow.sm]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <View style={[styles.settingIcon, { backgroundColor: `${Palette.primary}15` }]}>
                <Ionicons name="person" size={20} color={Palette.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Edit Profile</Text>
                <Text style={styles.settingDesc}>Update your personal information</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')}>
              <View style={[styles.settingIcon, { backgroundColor: `${Palette.warning}15` }]}>
                <Ionicons name="lock-closed" size={20} color={Palette.warning} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDesc}>Update your login credentials</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {renderToggleSection('Notifications', NOTIFICATION_SETTINGS)}
        {renderToggleSection('Privacy', PRIVACY_SETTINGS)}
        {renderToggleSection('Appearance', APPEARANCE_SETTINGS)}

        {/* Storage & Data */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>Storage & Data</Text>
          <View style={[styles.settingsCard, Shadow.sm]}>
            <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Cache Cleared', 'All cached data has been removed.')}>
              <View style={[styles.settingIcon, { backgroundColor: `${Palette.danger}15` }]}>
                <Ionicons name="trash" size={20} color={Palette.danger} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDesc}>Free up storage space</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: `${Palette.info}15` }]}>
                <Ionicons name="download" size={20} color={Palette.info} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Downloaded Content</Text>
                <Text style={styles.settingDesc}>Manage offline files</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>Legal</Text>
          <View style={[styles.settingsCard, Shadow.sm]}>
            {[
              { label: 'Terms of Service', icon: 'document-text' as const },
              { label: 'Privacy Policy', icon: 'shield-checkmark' as const },
              { label: 'Licenses', icon: 'code-slash' as const },
            ].map((item, index) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={styles.settingRow}>
                  <View style={[styles.settingIcon, { backgroundColor: `${Palette.textMuted}15` }]}>
                    <Ionicons name={item.icon} size={20} color={Palette.textMuted} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
                </TouchableOpacity>
                {index < 2 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <Text style={styles.versionText}>LearnVerse v2.3 • Build 2026.04</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 56,
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
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  settingsSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    backgroundColor: Palette.bgCard,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: Palette.textPrimary,
    fontSize: 15,
  },
  settingDesc: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginLeft: 64,
  },
  versionText: {
    ...Typography.small,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
