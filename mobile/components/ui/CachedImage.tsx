import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from 'react-native';
import { Image, ImageProps, ImageContentFit } from 'expo-image';

interface CachedImageProps extends Omit<ImageProps, 'style' | 'contentFit' | 'resizeMode'> {
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'; // For backwards compatibility
}

const CachedImage: React.FC<CachedImageProps> = ({ 
  style, 
  contentFit = 'cover',
  resizeMode,
  source,
  onLoadStart,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  // Map legacy resizeMode to expo-image contentFit
  const fit = resizeMode === 'contain' ? 'contain' : contentFit;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isLoading, pulseAnim]);

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.skeleton, { opacity: pulseAnim }]} />
      )}
      <Image
        {...props}
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit={fit}
        transition={300}
        cachePolicy="memory-disk"
        onLoadStart={() => {
          setIsLoading(true);
          onLoadStart?.();
        }}
        onLoad={(e) => {
          setIsLoading(false);
          onLoad?.(e);
        }}
        onError={(e) => {
          setIsLoading(false);
          onError?.(e);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e2e8f0', // default gray background
  },
  skeleton: {
    backgroundColor: '#94a3b8',
    zIndex: 1,
  },
});

export default CachedImage;
