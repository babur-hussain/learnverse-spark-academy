import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const PLANS = [
  {
    id: 'free',
    name: 'Basic Plan',
    price: 'Free',
    duration: 'Forever',
    features: ['Access to basic courses', 'Community forum access', 'Standard support'],
    color: Palette.info,
    gradient: [Palette.info, Palette.infoLight],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹999',
    duration: '/month',
    features: ['All basic features', 'Unlimited course access', 'Live doubt clearing', 'Download for offline viewing', 'Priority 24/7 support'],
    color: Palette.primary,
    gradient: Palette.gradientPrimary,
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Yearly',
    price: '₹9,999',
    duration: '/year',
    features: ['All premium features', '1-on-1 mentorship', 'Certification for all courses', 'Exclusive webinar access'],
    color: Palette.purple,
    gradient: [Palette.purple, Palette.purpleLight],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const handleSubscribe = () => {
    if (selectedPlan === 'free') {
      Alert.alert('Free Plan', 'You are currently on the Free plan. Enjoy learning!');
      return;
    }
    const plan = PLANS.find(p => p.id === selectedPlan);
    Alert.alert(
      'Upgrade to ' + (plan?.name || 'Premium'),
      `You've selected the ${plan?.name} plan at ${plan?.price}${plan?.duration}. Payment processing will be set up for your region shortly. We'll notify you when it's ready!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Notify Me', onPress: () => Alert.alert('Got it!', 'We\'ll let you know as soon as payments are live in your region. 🎉') }
      ]
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
          <Text style={styles.title}>Subscriptions</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Upgrade Your Learning</Text>
          <Text style={styles.heroSubtitle}>Choose a plan that best fits your educational journey.</Text>
        </View>

        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                Shadow.md,
                selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.9}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.selectBtn, selectedPlan === plan.id && { backgroundColor: plan.color }]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <Text style={[styles.selectBtnText, selectedPlan === plan.id && { color: '#fff' }]}>
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || Spacing.lg }, Shadow.glow(Palette.primary)]}>
        <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} activeOpacity={0.8}>
          <LinearGradient
            colors={PLANS.find(p => p.id === selectedPlan)?.gradient as any || Palette.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeText}>Continue with {PLANS.find(p => p.id === selectedPlan)?.name}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  heroTitle: {
    ...Typography.h1,
    color: Palette.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  plansContainer: {
    gap: Spacing.xl,
  },
  planCard: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    zIndex: 1,
  },
  popularText: {
    ...Typography.small,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  planName: {
    ...Typography.h3,
    color: Palette.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    ...Typography.hero,
  },
  planDuration: {
    ...Typography.body,
    color: Palette.textMuted,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginBottom: Spacing.lg,
  },
  featuresList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    ...Typography.body,
    color: Palette.textPrimary,
    flex: 1,
  },
  selectBtn: {
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Palette.bgCardElevated,
  },
  selectBtnText: {
    ...Typography.button,
    color: Palette.textPrimary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.bgCard,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  subscribeBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  subscribeText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 16,
  },
});
