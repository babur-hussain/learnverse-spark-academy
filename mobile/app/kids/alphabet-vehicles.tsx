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

const VEHICLES = [
  {l:'A',e:'🚑',n:'Ambulance',f:'Rushes to save lives!',s:'160 km/h'},
  {l:'B',e:'🚲',n:'Bicycle',f:'Zero fuel needed!',s:'30 km/h'},
  {l:'C',e:'🚗',n:'Car',f:'Most popular vehicle!',s:'200 km/h'},
  {l:'D',e:'🚜',n:'Dumper',f:'Carries heavy loads!',s:'60 km/h'},
  {l:'E',e:'🚒',n:'Engine truck',f:'Fights fires fast!',s:'130 km/h'},
  {l:'F',e:'🏎️',n:'Formula car',f:'Fastest race car!',s:'372 km/h'},
  {l:'G',e:'🛻',n:'Go-kart',f:'Kids love racing me!',s:'110 km/h'},
  {l:'H',e:'🚁',n:'Helicopter',f:'I can hover in place!',s:'300 km/h'},
  {l:'I',e:'🛵',n:'Intercity bus',f:'Carries 50 people!',s:'120 km/h'},
  {l:'J',e:'✈️',n:'Jet plane',f:'I fly above clouds!',s:'900 km/h'},
  {l:'K',e:'🛺',n:'Kart',f:'Great for city trips!',s:'80 km/h'},
  {l:'L',e:'🚂',n:'Locomotive',f:'Pulls heavy trains!',s:'320 km/h'},
  {l:'M',e:'🏍️',n:'Motorcycle',f:'Two wheels, full speed!',s:'299 km/h'},
  {l:'N',e:'🚤',n:'Navi boat',f:'Glides on water!',s:'100 km/h'},
  {l:'O',e:'🛥️',n:'Off-road truck',f:'Built for rough terrain!',s:'180 km/h'},
  {l:'P',e:'🚓',n:'Police car',f:'Keeps roads safe!',s:'250 km/h'},
  {l:'Q',e:'🏇',n:'Quad bike',f:'Four wheels, no road needed!',s:'130 km/h'},
  {l:'R',e:'🚀',n:'Rocket',f:'I reach outer space!',s:'28000 km/h'},
  {l:'S',e:'🛸',n:'Scooter',f:'Zips through traffic!',s:'100 km/h'},
  {l:'T',e:'🚛',n:'Truck',f:'Delivers everything!',s:'150 km/h'},
  {l:'U',e:'🚇',n:'Underground',f:'Travels under the city!',s:'120 km/h'},
  {l:'V',e:'🚐',n:'Van',f:'Carries cargo and people!',s:'160 km/h'},
  {l:'W',e:'🛻',n:'Wagon',f:'Old school cool!',s:'90 km/h'},
  {l:'X',e:'🚤',n:'X-boat',f:'Fastest speed boat!',s:'220 km/h'},
  {l:'Y',e:'⛵',n:'Yacht',f:'Sails with the wind!',s:'70 km/h'},
  {l:'Z',e:'🛩️',n:'Zeppelin',f:'Giant sky balloon!',s:'130 km/h'}
];

const BORDERS = ['#FF4444', '#FFD700', '#00C8FF', '#FF6BFF', '#2ECC40', '#FF9F43'];

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function AlphabetVehiclesScreen() {
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
  const roadAnimation = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startNewGame();
    startAnimations();
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

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnimation, { toValue: -6, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnimation, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(roadAnimation, {
        toValue: -60,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const popCard = () => {
    cardScale.setValue(0.95);
    Animated.spring(cardScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
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
    const currentVehicle = VEHICLES[currentOrder[index]];
    const wrongAnswers = shuffle(VEHICLES.filter(v => v.l !== currentVehicle.l)).slice(0, 3).map(v => v.l);
    setOptions(shuffle([currentVehicle.l, ...wrongAnswers]));
  };

  const handleOptionPress = (letter: string) => {
    if (done) return;
    const currentVehicle = VEHICLES[order[currentIndex]];
    const isCorrect = letter === currentVehicle.l;

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
      setSelectedLetters(prev => ({ ...prev, [letter]: 'wrong', [currentVehicle.l]: 'correct' }));
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

  const currentVehicle = VEHICLES[order[currentIndex]];
  const currentColor = BORDERS[order[currentIndex] % BORDERS.length];

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.gameOverContent}>
          <Text style={styles.gameOverEmoji}>{score >= 22 ? '🏆' : score >= 14 ? '🏍️' : '🚗'}</Text>
          <Text style={styles.gameOverTitle}>{score >= 22 ? 'CHAMPION!' : score >= 14 ? 'SPEED STAR!' : 'GOOD DRIVE!'}</Text>
          <Text style={styles.gameOverText}>You scored <Text style={{fontWeight: '900', color: '#FFD700'}}>{score}</Text> out of 26!</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={startNewGame} activeOpacity={0.8}>
            <LinearGradient colors={['#FF4444', '#FFD700']} style={styles.restartGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
              <Text style={styles.restartBtnText}>RACE AGAIN 🏁</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fake scanlines using absolute views or borders if needed, skipping for native simplicity */}

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.logoTitle}>SPEED ABCs</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>🏁 {score}</Text>
        </View>
      </View>

      <View style={styles.navContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {VEHICLES.map((_, i) => {
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
                ]}>{VEHICLES[i].l}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <LinearGradient 
            colors={['#FF4444', '#FFD700']} 
            start={{x:0,y:0}} end={{x:1,y:0}} 
            style={[styles.progressFill, { width: `${(currentIndex / 26) * 100}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>{currentIndex} / 26</Text>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.vehicleCard, { transform: [{ scale: cardScale }], borderColor: currentColor + '55' }]}>
          <Text style={[styles.bgLetter, { color: '#FFD70008' }]}>{currentVehicle.l}</Text>
          <View style={styles.speedBadge}>
            <Text style={styles.speedText}>{currentVehicle.s}</Text>
          </View>
          
          <View style={styles.road}>
            {[10, 70, 130, 190, 250, 310].map(left => (
              <Animated.View key={left} style={[styles.roadLine, { left, transform: [{ translateX: roadAnimation }] }]} />
            ))}
          </View>

          <Animated.Text style={[styles.emoji, { transform: [{ translateY: bobAnimation }] }]}>{currentVehicle.e}</Animated.Text>
          <Text style={styles.vehicleName}>{currentVehicle.n.toUpperCase()}</Text>
          <Text style={styles.vehicleFact}>{currentVehicle.f}</Text>
        </Animated.View>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>What letter does it start with?</Text>
          <Text style={styles.questionText}>{currentVehicle.e} {currentVehicle.n.toUpperCase()}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {options.map((opt) => {
            const m = VEHICLES.find(x => x.l === opt)!;
            const optColor = BORDERS[VEHICLES.indexOf(m) % BORDERS.length];
            const status = selectedLetters[opt];
            
            return (
              <TouchableOpacity 
                key={opt} 
                style={[
                  styles.optionBtn, 
                  { borderColor: optColor + '44' },
                  status === 'correct' && styles.optionCorrect,
                  status === 'wrong' && styles.optionWrong
                ]}
                activeOpacity={0.8}
                onPress={() => handleOptionPress(opt)}
              >
                <Text style={styles.optEmoji}>{m.e}</Text>
                <Text style={[
                  styles.optLetter,
                  status === 'correct' && { color: '#2ECC40', textShadowColor: '#2ECC4088', textShadowRadius: 10 },
                  status === 'wrong' && { color: '#FF4444' }
                ]}>{opt}</Text>
                <Text style={[
                  styles.optName,
                  status === 'correct' && { color: '#2ECC40' },
                  status === 'wrong' && { color: '#FF4444' }
                ]}>{m.n.toUpperCase()}</Text>
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
    backgroundColor: '#0D0D0F',
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
    backgroundColor: '#1A1A20',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textShadowColor: '#FFD70066',
    textShadowRadius: 10,
  },
  scoreBadge: {
    backgroundColor: '#1A1A20',
    borderWidth: 1,
    borderColor: '#FFD70044',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontWeight: '900',
    color: '#FFD700',
    fontSize: 14,
  },
  navContainer: {
    marginVertical: 10,
  },
  navScroll: {
    paddingHorizontal: Spacing.xl,
    gap: 5,
  },
  navBlock: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#1A1A20',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBlockDone: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  navBlockCur: {
    backgroundColor: '#FF4444',
    borderColor: '#FF6666',
    transform: [{ scale: 1.15 }],
  },
  navBlockText: {
    fontWeight: '900',
    color: '#444444',
    fontSize: 10,
  },
  navBlockTextDone: {
    color: '#0D0D0F',
  },
  navBlockTextCur: {
    color: '#FFFFFF',
  },
  progressWrap: {
    paddingHorizontal: Spacing.xl,
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1A1A20',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#444444',
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 4,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  vehicleCard: {
    backgroundColor: '#151518',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bgLetter: {
    position: 'absolute',
    right: -8,
    top: -10,
    fontSize: 100,
    fontWeight: '900',
  },
  speedBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: '#FF4444',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  road: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: '#1A1A20',
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  roadLine: {
    position: 'absolute',
    bottom: 13,
    height: 4,
    width: 30,
    backgroundColor: '#FFD70044',
    borderRadius: 2,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 4,
    textShadowColor: 'rgba(255,215,0,0.2)',
    textShadowRadius: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
    textShadowColor: '#FFD70044',
    textShadowRadius: 10,
  },
  vehicleFact: {
    fontSize: 11,
    color: '#555555',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: '#151518',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A35',
    padding: 10,
    alignItems: 'center',
    marginBottom: 11,
  },
  questionLabel: {
    fontSize: 10,
    color: '#444444',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 3,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  optionBtn: {
    width: (SCREEN_WIDTH - 2 * Spacing.xl - 9) / 2,
    backgroundColor: '#151518',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCorrect: {
    backgroundColor: '#0D2B0D',
    borderColor: '#2ECC40',
  },
  optionWrong: {
    backgroundColor: '#2B0D0D',
    borderColor: '#FF4444',
  },
  optEmoji: {
    fontSize: 26,
    marginBottom: 3,
  },
  optLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 2,
  },
  optName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555555',
    letterSpacing: 0.5,
  },
  gameOverContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  gameOverTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 6,
    letterSpacing: 2,
    textShadowColor: '#FFD70066',
    textShadowRadius: 14,
  },
  gameOverText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  restartBtn: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    ...Shadow.md,
  },
  restartGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  restartBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D0D0F',
    letterSpacing: 2,
  },
});
