import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try backend first
        let backendProfile = null;
        try {
          const profileRes = await api.get('/users/profile');
          backendProfile = profileRes.data;
        } catch (err) {
          console.log('Could not fetch backend profile', err);
        }

        // Fallback to local storage if backend fields are missing
        const [phoneData, bioData, classData] = await Promise.all([
          AsyncStorage.getItem('user_phone'),
          AsyncStorage.getItem('user_bio'),
          AsyncStorage.getItem('user_class_id'),
        ]);

        const finalPhone = backendProfile?.phone || phoneData || '';
        const finalBio = backendProfile?.bio || bioData || '';
        const finalClass = backendProfile?.class_id || classData || '';

        setPhone(finalPhone);
        setBio(finalBio);
        setSelectedClass(finalClass);

        // Fetch classes
        const res = await api.get('/admin/classes', { params: { is_active: true } });
        setClasses(res.data?.data || res.data || []);
      } catch (e) {
        console.error('Failed to load profile data', e);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setSaving(true);
    try {
      if (user) {
        await updateProfile(user, {
          displayName: displayName.trim(),
        });
      }

      // Save to backend
      try {
        await api.put('/users/profile', {
          phone,
          bio,
          class_id: selectedClass || null
        });
      } catch (err) {
        console.error('Failed to save to backend profile', err);
      }

      // Save locally
      await AsyncStorage.setItem('user_phone', phone);
      await AsyncStorage.setItem('user_bio', bio);
      if (selectedClass) {
        await AsyncStorage.setItem('user_class_id', selectedClass);
      }
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with profile image */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6', '#ec4899'] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Personal Information</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Palette.textMuted}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Ionicons name="mail-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  style={[styles.input, { color: Palette.textMuted }]}
                  value={email}
                  editable={false}
                  placeholder="Email address"
                  placeholderTextColor={Palette.textMuted}
                />
                <Ionicons name="lock-closed" size={14} color={Palette.textMuted} />
              </View>
              <Text style={styles.fieldHint}>Email cannot be changed</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={Palette.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Palette.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Class / College</Text>
              <Text style={styles.fieldHint}>Select your class to customize your homepage.</Text>
              {loadingInitial ? (
                <ActivityIndicator size="small" color={Palette.primary} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classScroll}>
                  {classes.map(cls => {
                    const id = cls._id || cls.id;
                    const isSelected = selectedClass === id;
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => setSelectedClass(id)}
                        activeOpacity={0.8}
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={Palette.gradientPrimary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.classPill}
                          >
                            <Text style={styles.classPillTextActive}>{cls.name}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.classPillInactive}>
                            <Text style={styles.classPillText}>{cls.name}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, Shadow.sm]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, Shadow.sm]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Palette.gradientPrimary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                {saving ? (
                  <Text style={styles.saveBtnText}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: '#fff',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    ...Typography.h1,
    color: '#fff',
    fontSize: 36,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  scrollContent: {
    paddingTop: Spacing.xl,
  },
  formSection: {
    paddingHorizontal: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.lg,
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
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Palette.textPrimary,
    paddingVertical: 14,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 0,
  },
  fieldHint: {
    ...Typography.small,
    color: Palette.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  cancelBtnText: {
    ...Typography.button,
    color: Palette.textSecondary,
    fontSize: 15,
  },
  saveBtn: {
    flex: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderRadius: BorderRadius.md,
  },
  saveBtnText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 15,
  },
  classScroll: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: 10,
  },
  classPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  classPillInactive: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.bgCard,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  classPillTextActive: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
  classPillText: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
});
