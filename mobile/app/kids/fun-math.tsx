import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type MathMode = 'add' | 'subtract' | 'multiply' | 'divide';

const MODES: { id: MathMode; title: string; icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string]; sign: string }[] = [
  { id: 'add', title: 'Add', icon: 'add', colors: ['#ff9a9e', '#fecfef'] as const, sign: '+' },
  { id: 'subtract', title: 'Subtract', icon: 'remove', colors: ['#a1c4fd', '#c2e9fb'] as const, sign: '-' },
  { id: 'multiply', title: 'Multiply', icon: 'close', colors: ['#f6d365', '#fda085'] as const, sign: '×' },
  { id: 'divide', title: 'Divide', icon: 'ellipse-outline', colors: ['#84fab0', '#8fd3f4'] as const, sign: '÷' },
];

const EMOJIS = ['🚀', '🌟', '🎈', '🎉', '🦄', '🍎', '🧩', '🧸'];

// Fun floating background bubbles
const FloatingBubble = ({ delay, size, left }: { delay: number, size: number, left: any }) => {
  const animY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const animX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animY, {
            toValue: -150,
            duration: 6000 + Math.random() * 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animX, { toValue: 20, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
            Animated.timing(animX, { toValue: -20, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          ])
        ])
      ])
    );
    float.start();
    return () => float.stop();
  }, []);

  return (
    <Animated.View style={[
      styles.bubble,
      { width: size, height: size, borderRadius: size / 2, left, transform: [{ translateY: animY }, { translateX: animX }] }
    ]} />
  );
};

export default function FunMathScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<MathMode>('add');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [answer, setAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sound, setSound] = useState<Audio.Sound>();
  
  // Animations
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const popAnimation = useRef(new Animated.Value(1)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const feedbackScale = useRef(new Animated.Value(0.5)).current;
  const [feedbackText, setFeedbackText] = useState('Awesome!');

  useEffect(() => {
    generateEquation();
  }, [mode]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const playWrongSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/wrong.mp3'));
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Could not play sound", error);
    }
  };

  const triggerShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 60, useNativeDriver: true })
    ]).start();
  };

  const triggerPop = () => {
    popAnimation.setValue(0.8);
    Animated.spring(popAnimation, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Star pop
    starScale.setValue(1.5);
    Animated.spring(starScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

    // Feedback text pop
    const congrats = ['Awesome!', 'Super!', 'Wow!', 'Genius!', 'Great!', 'Keep going!'];
    setFeedbackText(congrats[Math.floor(Math.random() * congrats.length)]);
    feedbackOpacity.setValue(1);
    feedbackScale.setValue(0.5);
    Animated.parallel([
      Animated.spring(feedbackScale, { toValue: 1.2, friction: 5, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(feedbackOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ])
    ]).start();
  };

  const generateEquation = () => {
    let n1 = Math.floor(Math.random() * 10) + 1;
    let n2 = Math.floor(Math.random() * 10) + 1;
    let ans = 0;

    if (mode === 'add') {
      ans = n1 + n2;
    } else if (mode === 'subtract') {
      if (n1 < n2) { const temp = n1; n1 = n2; n2 = temp; }
      ans = n1 - n2;
    } else if (mode === 'multiply') {
      ans = n1 * n2;
    } else if (mode === 'divide') {
      n2 = Math.floor(Math.random() * 10) + 1; 
      ans = Math.floor(Math.random() * 10) + 1; 
      n1 = ans * n2;
    }

    let dummy1 = Math.floor(Math.random() * 20) + 1;
    let dummy2 = Math.floor(Math.random() * 20) + 1;
    
    while (dummy1 === ans) dummy1 = Math.floor(Math.random() * 20) + 1;
    while (dummy2 === ans || dummy2 === dummy1) dummy2 = Math.floor(Math.random() * 20) + 1;

    const newOptions = [ans, dummy1, dummy2].sort(() => Math.random() - 0.5);

    setNum1(n1);
    setNum2(n2);
    setAnswer(ans);
    setOptions(newOptions);
  };

  const handleOptionPress = (selected: number) => {
    if (selected === answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(s => s + 10);
      setStreak(s => s + 1);
      triggerPop();
      setTimeout(generateEquation, 400); // slight delay so kids see the pop before it changes
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playWrongSound();
      setStreak(0);
      triggerShake();
    }
  };

  const currentMode = MODES.find(m => m.id === mode)!;

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentMode.colors as any} style={StyleSheet.absoluteFillObject} />
      
      {/* Background Bubbles for playfulness */}
      <FloatingBubble delay={0} size={60} left="10%" />
      <FloatingBubble delay={1500} size={40} left="80%" />
      <FloatingBubble delay={3000} size={80} left="50%" />
      <FloatingBubble delay={4000} size={50} left="25%" />
      <FloatingBubble delay={5500} size={70} left="70%" />

      {/* Header & Score */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.scoreContainer}>
          <Animated.Text style={[styles.scoreText, { transform: [{ scale: starScale }] }]}>
            ⭐ {score}
          </Animated.Text>
          {streak > 2 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak} Streak!</Text>
            </View>
          )}
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modesContainer}>
        {MODES.map(m => {
          const isActive = mode === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.8}
              style={[
                styles.modeBtn,
                isActive ? styles.modeBtnActive : null,
                isActive ? Shadow.md : null
              ]}
              onPress={() => setMode(m.id)}
            >
              <Ionicons name={m.icon as any} size={20} color={isActive ? m.colors[1] : '#fff'} style={{ marginBottom: 4 }} />
              <Text style={[styles.modeText, isActive && styles.modeTextActive]}>
                {m.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Floating Success Feedback */}
        <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity, transform: [{ scale: feedbackScale }, { translateY: -40 }] }]}>
          <Text style={styles.feedbackText}>{feedbackText}</Text>
          <Text style={styles.feedbackEmoji}>{EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}</Text>
        </Animated.View>

        <Animated.View style={[styles.equationCard, Shadow.lg, { transform: [{ translateX: shakeAnimation }, { scale: popAnimation }] }]}>
          <Text style={[styles.number, { color: currentMode.colors[1] }]}>{num1}</Text>
          <Text style={[styles.sign, { color: '#94a3b8' }]}>{currentMode.sign}</Text>
          <Text style={[styles.number, { color: currentMode.colors[0] }]}>{num2}</Text>
          <Text style={[styles.sign, { color: '#94a3b8' }]}>=</Text>
          <View style={styles.questionMarkContainer}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionBtn,
                Shadow.lg,
                { backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d'][idx % 3] }
              ]}
              onPress={() => handleOptionPress(opt)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{opt}</Text>
              {/* Button highlight for 3D effect */}
              <View style={styles.buttonHighlight} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    bottom: -100,
  },
  header: {
    // paddingTop handled via inline style with insets.top
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  streakBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b45309',
  },
  modesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modeBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  modeTextActive: {
    color: '#334155',
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  feedbackContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    zIndex: 10,
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  feedbackEmoji: {
    fontSize: 48,
    marginTop: 4,
  },
  equationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
    borderRadius: 40,
    marginBottom: 60,
    width: '100%',
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  number: {
    fontSize: 56,
    fontWeight: '900',
    marginHorizontal: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  sign: {
    fontSize: 48,
    fontWeight: '800',
    marginHorizontal: 4,
  },
  questionMarkContainer: {
    backgroundColor: '#f1f5f9',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  questionMark: {
    fontSize: 40,
    fontWeight: '900',
    color: '#94a3b8',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  optionBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  optionText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    zIndex: 2,
  },
  buttonHighlight: {
    position: 'absolute',
    top: 5,
    left: 15,
    width: 30,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
});
