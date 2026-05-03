import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Palette } from '@/constants/theme';

interface CustomSplashScreenProps {
  onFinish: () => void;
  isAppReady: boolean;
}

export default function CustomSplashScreen({ onFinish, isAppReady }: CustomSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  // Hide the native splash screen as soon as our custom one mounts
  useEffect(() => {
    async function hideNativeSplash() {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore errors if already hidden
      }
    }
    hideNativeSplash();
  }, []);

  // When both the app is ready and the animation is finished, fade out
  useEffect(() => {
    if (isAppReady && isAnimationFinished) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }
  }, [isAppReady, isAnimationFinished, fadeAnim, onFinish]);

  // Safety fallback: if Lottie never fires onComplete (e.g. fails on Android),
  // mark animation as finished after a timeout so the splash always clears.
  useEffect(() => {
    const fallback = setTimeout(() => {
      setIsAnimationFinished(true);
    }, 4000);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.animationWrapper}>
        <LottieView
          source={require('@/assets/Lottie/Welcome.lottie')}
          autoPlay
          loop={false}
          onAnimationFinish={() => setIsAnimationFinished(true)}
          style={styles.animation}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it sits on top of everything
  },
  animationWrapper: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
