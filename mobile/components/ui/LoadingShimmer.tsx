import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Palette, BorderRadius } from '@/constants/theme';

interface ShimmerProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({ width, height, borderRadius = BorderRadius.md, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Palette.bgCardElevated,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ShimmerCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Shimmer width="100%" height={140} borderRadius={BorderRadius.lg} />
    <View style={styles.cardBody}>
      <Shimmer width="80%" height={16} />
      <Shimmer width="60%" height={12} style={{ marginTop: 8 }} />
      <View style={styles.cardFooter}>
        <Shimmer width={60} height={16} />
        <Shimmer width={80} height={32} borderRadius={BorderRadius.sm} />
      </View>
    </View>
  </View>
);

export const ShimmerRow: React.FC = () => (
  <View style={styles.row}>
    <Shimmer width={60} height={60} borderRadius={30} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Shimmer width="70%" height={16} />
      <Shimmer width="50%" height={12} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardBody: {
    padding: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
  },
});
