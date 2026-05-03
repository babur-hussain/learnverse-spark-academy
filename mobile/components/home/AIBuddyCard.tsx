import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Palette, BorderRadius, Typography, Spacing, Shadow } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AIBuddyCard: React.FC = () => {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const navigateToChat = () => {
    router.push('/ai' as any);
  };

  return (
    <Animated.View style={[styles.outerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={navigateToChat}
        style={[styles.container, Shadow.md]}
      >
        {/* Top section with text and animation */}
        <View style={styles.topRow}>
          <View style={styles.textContent}>
            <View style={styles.aiLabel}>
              <View style={styles.aiDot} />
              <Text style={styles.aiLabelText}>Your A.I buddy</Text>
            </View>
            <Text style={styles.title}>
              Start With{'\n'}
              <Text style={styles.titleAccent}>Padhaai Wala</Text>
            </Text>
          </View>
          <View style={styles.animationContainer}>
            <LottieView
              source={require('@/assets/Lottie/machine-learning.lottie')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="camera-outline" size={20} color={Palette.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="mic-outline" size={20} color={Palette.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.askInput}
            onPress={navigateToChat}
          >
            <Text style={styles.askPlaceholder}>Ask an expert...</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  container: {
    backgroundColor: '#FFF5EB',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 6,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  aiLabelText: {
    ...Typography.caption,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
    lineHeight: 28,
  },
  titleAccent: {
    color: Palette.primary,
    fontWeight: '800',
  },
  animationContainer: {
    width: 100,
    height: 100,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  askInput: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    ...Shadow.sm,
  },
  askPlaceholder: {
    ...Typography.body,
    color: Palette.textMuted,
  },
});

export default AIBuddyCard;
