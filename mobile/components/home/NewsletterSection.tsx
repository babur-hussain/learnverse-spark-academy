import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) {
      Alert.alert('Please enter your email');
      return;
    }
    Alert.alert('Subscribed!', 'You\'ll receive our latest updates and learning tips.');
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.card}
      >
        {/* Decorative */}
        <View style={styles.decor1} />
        <View style={styles.decor2} />

        <Ionicons name="mail" size={40} color={Palette.primary} style={styles.icon} />
        <Text style={styles.title}>Stay Updated</Text>
        <Text style={styles.subtitle}>
          Get the latest courses, tips, and learning resources delivered to your inbox.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Palette.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleSubscribe} activeOpacity={0.8}>
            <LinearGradient
              colors={Palette.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeBtn}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'],
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadow.lg,
  },
  decor1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Palette.primary,
    opacity: 0.05,
    top: -30,
    right: -30,
  },
  decor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.purple,
    opacity: 0.05,
    bottom: -20,
    left: -20,
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Palette.bgCardElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    ...Typography.body,
    color: Palette.textPrimary,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  subscribeBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewsletterSection;
