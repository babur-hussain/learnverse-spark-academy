import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !fullName)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        await api.post('/users/register', {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          full_name: fullName,
          role: 'student'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      await AsyncStorage.removeItem('guestMode');
      router.replace('/(tabs)');
    } catch (error: any) {
      let message = error.message || 'An error occurred';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email';
      else if (error.code === 'auth/wrong-password') message = 'Incorrect password';
      else if (error.code === 'auth/email-already-in-use') message = 'This email is already registered';
      else if (error.code === 'auth/invalid-email') message = 'Please enter a valid email';
      else if (error.code === 'auth/weak-password') message = 'Password must be at least 6 characters';
      Alert.alert(isSignUp ? 'Registration Failed' : 'Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Enter Email', 'Please enter your email address to reset password');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email Sent', 'Check your inbox for password reset instructions');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('guestMode', 'true');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Skip Failed', 'Failed to store guest session mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & branding */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={Palette.gradientPrimary as any}
                style={styles.logoGradient}
              >
                <Ionicons name="school" size={36} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>LearnVerse</Text>
            <Text style={styles.tagline}>Spark Academy</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, Shadow.lg]}>
            <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Start your learning journey today' : 'Sign in to continue learning'}
            </Text>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color={Palette.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Palette.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={Palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Palette.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={Palette.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Palette.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={Palette.textMuted} />
              </TouchableOpacity>
            </View>

            {!isSignUp && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Auth button */}
            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.authBtn}
            >
              <LinearGradient
                colors={Palette.gradientPrimary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.authBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name={isSignUp ? 'person-add' : 'log-in'} size={20} color="#fff" />
                    <Text style={styles.authBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle sign up / sign in */}
            <TouchableOpacity
              style={styles.toggleLink}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.toggleHighlight}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Guest mode */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="compass-outline" size={20} color={Palette.textSecondary} />
              <Text style={styles.skipText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Palette.primary,
    opacity: 0.04,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Palette.purple,
    opacity: 0.04,
    bottom: 100,
    left: -40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    ...Typography.hero,
    color: Palette.textPrimary,
    fontSize: 32,
  },
  tagline: {
    ...Typography.caption,
    color: Palette.primary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  card: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'],
    borderWidth: 1,
    borderColor: Palette.border,
  },
  title: {
    ...Typography.h1,
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCardElevated,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: 10,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Palette.textPrimary,
    paddingVertical: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: -8,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Palette.primary,
    fontWeight: '600',
  },
  authBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  authBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderRadius: BorderRadius.md,
  },
  authBtnText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 16,
  },
  toggleLink: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  toggleText: {
    ...Typography.body,
    color: Palette.textSecondary,
    fontSize: 14,
  },
  toggleHighlight: {
    color: Palette.primary,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.border,
  },
  dividerText: {
    ...Typography.small,
    color: Palette.textMuted,
    paddingHorizontal: 16,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 8,
  },
  skipText: {
    ...Typography.body,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
});
