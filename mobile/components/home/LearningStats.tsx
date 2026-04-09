import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const STATS = [
  { label: 'Students', value: 10000, suffix: '+', icon: 'people' as const, color: Palette.primary },
  { label: 'Courses', value: 500, suffix: '+', icon: 'book' as const, color: Palette.success },
  { label: 'Educators', value: 50, suffix: '+', icon: 'school' as const, color: Palette.purple },
  { label: 'Hours Content', value: 2000, suffix: '+', icon: 'time' as const, color: Palette.orange },
];

const AnimatedCounter: React.FC<{ value: number; suffix: string }> = ({ value, suffix }) => {
  const animVal = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = React.useState(0);

  useEffect(() => {
    Animated.timing(animVal, { toValue: value, duration: 1500, useNativeDriver: false }).start();
    const listener = animVal.addListener(({ value: v }) => setDisplayVal(Math.floor(v)));
    return () => animVal.removeListener(listener);
  }, [value]);

  const formatNum = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return String(n);
  };

  return <Text style={styles.statValue}>{formatNum(displayVal)}{suffix}</Text>;
};

const LearningStats: React.FC = () => {
  return (
    <View style={styles.container}>
      <SectionHeader title="Our Impact" subtitle="Numbers that matter" />
      <View style={styles.grid}>
        {STATS.map((stat, i) => (
          <View key={i} style={[styles.statCard, Shadow.sm]}>
            <View style={[styles.iconCircle, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h1,
    color: Palette.textPrimary,
    fontSize: 24,
  },
  statLabel: {
    ...Typography.caption,
    color: Palette.textMuted,
    marginTop: 4,
  },
});

export default LearningStats;
