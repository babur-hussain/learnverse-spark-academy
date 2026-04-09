import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Not signed in');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert('Success', 'Password updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const msg = error.code === 'auth/wrong-password'
        ? 'Current password is incorrect'
        : error.message || 'Failed to change password';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    setter: (v: string) => void,
    show: boolean,
    toggleShow: () => void,
    placeholder: string
  ) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={18} color={Palette.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setter}
          placeholder={placeholder}
          placeholderTextColor={Palette.textMuted}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={toggleShow}>
          <Ionicons name={show ? 'eye' : 'eye-off'} size={20} color={Palette.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#0f172a'] as any}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Palette.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Security info */}
          <View style={[styles.infoCard, Shadow.sm]}>
            <View style={[styles.infoIcon, { backgroundColor: `${Palette.warning}15` }]}>
              <Ionicons name="shield-checkmark" size={24} color={Palette.warning} />
            </View>
            <Text style={styles.infoText}>
              For security, please enter your current password before creating a new one.
            </Text>
          </View>

          {renderPasswordField('Current Password', currentPassword, setCurrentPassword, showCurrent, () => setShowCurrent(!showCurrent), 'Enter current password')}
          {renderPasswordField('New Password', newPassword, setNewPassword, showNew, () => setShowNew(!showNew), 'Enter new password')}
          {renderPasswordField('Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, () => setShowConfirm(!showConfirm), 'Re-enter new password')}

          {/* Password requirements */}
          <View style={styles.requirements}>
            <Text style={styles.reqTitle}>Password must:</Text>
            {[
              { text: 'Be at least 6 characters', met: newPassword.length >= 6 },
              { text: 'Match the confirmation', met: newPassword.length > 0 && newPassword === confirmPassword },
            ].map((req, i) => (
              <View key={i} style={styles.reqRow}>
                <Ionicons
                  name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={req.met ? Palette.success : Palette.textMuted}
                />
                <Text style={[styles.reqText, req.met && { color: Palette.success }]}>{req.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, Shadow.md]}
            onPress={handleChangePassword}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Palette.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? 'Updating...' : 'Update Password'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    padding: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  field: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: Spacing.lg,
    gap: 10,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Palette.textPrimary,
    paddingVertical: 14,
  },
  requirements: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  reqTitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginBottom: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  reqText: {
    ...Typography.caption,
    color: Palette.textMuted,
  },
  saveBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: BorderRadius.md,
  },
  saveBtnText: {
    ...Typography.button,
    color: '#fff',
  },
});
