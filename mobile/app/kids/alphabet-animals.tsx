import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ANIMALS = [
  { l: 'A', e: '🐊', n: 'Alligator', f: 'I have 80 teeth!' },
  { l: 'B', e: '🦋', n: 'Butterfly', f: 'I start as a caterpillar!' },
  { l: 'C', e: '🐱', n: 'Cat', f: 'I purr when I am happy!' },
  { l: 'D', e: '🦌', n: 'Deer', f: 'My antlers grow back!' },
  { l: 'E', e: '🐘', n: 'Elephant', f: 'I have great memory!' },
  { l: 'F', e: '🦊', n: 'Fox', f: 'I am very clever!' },
  { l: 'G', e: '🦒', n: 'Giraffe', f: 'My neck is 6 feet long!' },
  { l: 'H', e: '🦛', n: 'Hippo', f: 'I love the water!' },
  { l: 'I', e: '🦎', n: 'Iguana', f: 'I love sunny rocks!' },
  { l: 'J', e: '🐆', n: 'Jaguar', f: 'I am a great swimmer!' },
  { l: 'K', e: '🦘', n: 'Kangaroo', f: 'I carry my baby in a pouch!' },
  { l: 'L', e: '🦁', n: 'Lion', f: 'I am king of the jungle!' },
  { l: 'M', e: '🐒', n: 'Monkey', f: 'I love to swing on trees!' },
  { l: 'N', e: '🦭', n: 'Narwhal', f: 'My tusk is a tooth!' },
  { l: 'O', e: '🦦', n: 'Otter', f: 'I hold hands while sleeping!' },
  { l: 'P', e: '🦜', n: 'Parrot', f: 'I can talk like you!' },
  { l: 'Q', e: '🐦', n: 'Quail', f: 'I hide in the grass!' },
  { l: 'R', e: '🦝', n: 'Raccoon', f: 'I wash my food!' },
  { l: 'S', e: '🐍', n: 'Snake', f: 'I have no legs at all!' },
  { l: 'T', e: '🐅', n: 'Tiger', f: 'My stripes are unique!' },
  { l: 'U', e: '🦄', n: 'Unicorn', f: 'I am magical and rare!' },
  { l: 'V', e: '🦅', n: 'Vulture', f: 'I can soar for hours!' },
  { l: 'W', e: '🐺', n: 'Wolf', f: 'I howl at the moon!' },
  { l: 'X', e: '🐾', n: 'Xerus', f: 'I am a ground squirrel!' },
  { l: 'Y', e: '🦬', n: 'Yak', f: 'I live on cold mountains!' },
  { l: 'Z', e: '🦓', n: 'Zebra', f: 'My stripes are all mine!' }
];

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF9F43', '#C44AFF', '#FF66A3', '#00C9A7'];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function AlphabetAnimalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState<Audio.Sound>();

  const bobAnimation = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startNewGame();
    startBobbing();
  }, []);

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

  const startBobbing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnimation, { toValue: -10, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnimation, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  };

  const popCard = () => {
    cardScale.setValue(0.9);
    Animated.spring(cardScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const startNewGame = () => {
    const newOrder = shuffle(Array.from({ length: 26 }, (_, i) => i));
    setOrder(newOrder);
    setCurrentIndex(0);
    setScore(0);
    setGameOver(false);
    loadQuestion(0, newOrder);
  };

  const loadQuestion = (index: number, currentOrder: number[]) => {
    setDone(false);
    setSelectedLetters({});
    popCard();
    const currentAnimal = ANIMALS[currentOrder[index]];
    const wrongAnswers = shuffle(ANIMALS.filter(a => a.l !== currentAnimal.l)).slice(0, 3).map(a => a.l);
    setOptions(shuffle([currentAnimal.l, ...wrongAnswers]));
  };

  const handleOptionPress = (letter: string) => {
    if (done) return;
    const currentAnimal = ANIMALS[order[currentIndex]];
    const isCorrect = letter === currentAnimal.l;

    setSelectedLetters(prev => ({ ...prev, [letter]: isCorrect ? 'correct' : 'wrong' }));

    if (isCorrect) {
      setDone(true);
      setScore(s => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        if (currentIndex + 1 >= 26) {
          setGameOver(true);
        } else {
          setCurrentIndex(i => i + 1);
          loadQuestion(currentIndex + 1, order);
        }
      }, 1000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playWrongSound();
      setDone(true);
      // Mark the correct one too
      setSelectedLetters(prev => ({ ...prev, [letter]: 'wrong', [currentAnimal.l]: 'correct' }));
      setTimeout(() => {
        if (currentIndex + 1 >= 26) {
          setGameOver(true);
        } else {
          setCurrentIndex(i => i + 1);
          loadQuestion(currentIndex + 1, order);
        }
      }, 1200);
    }
  };

  if (order.length === 0) return null;

  const currentAnimal = ANIMALS[order[currentIndex]];
  const currentColor = COLORS[order[currentIndex] % COLORS.length];

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.gameOverContent}>
          <Text style={styles.gameOverEmoji}>{score >= 22 ? '🏆' : score >= 14 ? '🌟' : '🎈'}</Text>
          <Text style={styles.gameOverTitle}>{score >= 22 ? 'Amazing!' : score >= 14 ? 'Super Star!' : 'Great Try!'}</Text>
          <Text style={styles.gameOverText}>You got <Text style={{fontWeight: 'bold', color: '#FF6B6B'}}>{score}</Text> out of 26!</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={startNewGame} activeOpacity={0.8}>
            <LinearGradient colors={['#FF6B6B', '#C44AFF']} style={styles.restartGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
              <Text style={styles.restartBtnText}>Play Again! 🎉</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <View style={[styles.bgBlob, { top: -50, left: -50, backgroundColor: '#FFE0E033' }]} />
      <View style={[styles.bgBlob, { bottom: -50, right: -50, backgroundColor: '#D0F0FF33' }]} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.logoTitle}>ABC Animals!</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <View style={styles.navContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {ANIMALS.map((_, i) => {
            const pos = order.indexOf(i);
            const isDone = pos < currentIndex;
            const isCur = pos === currentIndex;
            return (
              <View key={i} style={[
                styles.navBlock,
                isDone && styles.navBlockDone,
                isCur && styles.navBlockCur
              ]}>
                <Text style={[
                  styles.navBlockText,
                  isDone && styles.navBlockTextDone,
                  isCur && styles.navBlockTextCur
                ]}>{ANIMALS[i].l}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <LinearGradient 
            colors={['#6BCB77', '#4D96FF']} 
            start={{x:0,y:0}} end={{x:1,y:0}} 
            style={[styles.progressFill, { width: `${(currentIndex / 26) * 100}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>{currentIndex} / 26</Text>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.animalCard, { transform: [{ scale: cardScale }], borderColor: currentColor + '66' }]}>
          <LinearGradient colors={[`${currentColor}22`, '#ffffff']} style={StyleSheet.absoluteFillObject} />
          <Text style={[styles.bgLetter, { color: currentColor }]}>{currentAnimal.l}</Text>
          <Animated.Text style={[styles.emoji, { transform: [{ translateY: bobAnimation }] }]}>{currentAnimal.e}</Animated.Text>
          <Text style={styles.animalName}>{currentAnimal.n}</Text>
          <Text style={styles.animalFact}>{currentAnimal.f}</Text>
        </Animated.View>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>What letter does it start with?</Text>
          <Text style={styles.questionText}>{currentAnimal.e} {currentAnimal.n.toUpperCase()}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {options.map((opt) => {
            const m = ANIMALS.find(x => x.l === opt)!;
            const optColor = COLORS[ANIMALS.indexOf(m) % COLORS.length];
            const status = selectedLetters[opt];
            
            return (
              <TouchableOpacity 
                key={opt} 
                style={[
                  styles.optionBtn, 
                  { borderColor: optColor + '66' },
                  status === 'correct' && styles.optionCorrect,
                  status === 'wrong' && styles.optionWrong
                ]}
                activeOpacity={0.8}
                onPress={() => handleOptionPress(opt)}
              >
                <Text style={styles.optEmoji}>{m.e}</Text>
                <Text style={[
                  styles.optLetter,
                  status === 'correct' && { color: '#27500A' },
                  status === 'wrong' && { color: '#791F1F' }
                ]}>{opt}</Text>
                <Text style={[
                  styles.optName,
                  status === 'correct' && { color: '#27500A' },
                  status === 'wrong' && { color: '#791F1F' }
                ]}>{m.n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  bgBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    // paddingTop handled via inline style with insets.top
    paddingBottom: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B6B',
  },
  scoreBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontWeight: '900',
    color: '#7A5200',
    fontSize: 16,
  },
  navContainer: {
    marginVertical: 10,
  },
  navScroll: {
    paddingHorizontal: Spacing.xl,
    gap: 5,
  },
  navBlock: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBlockDone: {
    backgroundColor: '#6BCB77',
  },
  navBlockCur: {
    backgroundColor: '#FFD93D',
    transform: [{ scale: 1.15 }],
  },
  navBlockText: {
    fontWeight: '800',
    color: '#CCCCCC',
  },
  navBlockTextDone: {
    color: '#FFFFFF',
  },
  navBlockTextCur: {
    color: '#7A5200',
  },
  progressWrap: {
    paddingHorizontal: Spacing.xl,
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E8E0D5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  animalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2.5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bgLetter: {
    position: 'absolute',
    right: 10,
    bottom: -10,
    fontSize: 100,
    opacity: 0.1,
    fontWeight: '900',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  animalName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333333',
    letterSpacing: 1,
  },
  animalFact: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E8E0D5',
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 11,
    color: '#BBBBBB',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#444444',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionBtn: {
    width: (SCREEN_WIDTH - 2 * Spacing.xl - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCorrect: {
    backgroundColor: '#6BCB77',
    borderColor: '#4aaa55',
  },
  optionWrong: {
    backgroundColor: '#FF6B6B',
    borderColor: '#cc4444',
  },
  optEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  optLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 2,
  },
  optName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999999',
  },
  gameOverContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  gameOverEmoji: {
    fontSize: 100,
    marginBottom: 16,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  gameOverText: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 32,
  },
  restartBtn: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    ...Shadow.md,
  },
  restartGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  restartBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
