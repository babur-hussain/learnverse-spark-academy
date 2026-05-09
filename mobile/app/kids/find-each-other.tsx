import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GameHeader from '@/components/games/GameHeader';
import VirtualKeyboard from '@/components/games/VirtualKeyboard';
import { playLetterSound, playSuccessSound, playWrongSound, playJumpSound } from '@/utils/sound';

const { width } = Dimensions.get('window');
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

export default function FindEachOtherScreen() {
  const [targetLetter, setTargetLetter] = useState('A');
  const [level, setLevel] = useState(1);
  const [stepsTaken, setStepsTaken] = useState(0);
  const totalSteps = 5;
  const [currentPlayer, setCurrentPlayer] = useState<'chick' | 'cat'>('chick');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animations
  const chickAnim = React.useRef(new Animated.Value(0)).current;
  const catAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pickNewLetter();
    startIdleAnimation();
  }, []);

  const startIdleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ])
    ).start();
  };

  const pickNewLetter = () => {
    const randomLetter = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    setTargetLetter(randomLetter);
    setTimeout(() => playLetterSound(randomLetter), 500);
  };

  const handleKeyPress = (key: string) => {
    if (isAnimating) return;

    if (key === targetLetter) {
      playJumpSound();
      setIsAnimating(true);
      
      const newSteps = stepsTaken + 1;
      const progress = newSteps / totalSteps;
      
      // Move character
      const moveAnim = currentPlayer === 'chick' ? chickAnim : catAnim;
      const targetValue = progress * (width * 0.35); // Max move towards center

      Animated.timing(moveAnim, {
        toValue: targetValue,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }).start(() => {
        setIsAnimating(false);
        setStepsTaken(newSteps);
        
        if (newSteps >= totalSteps) {
          playSuccessSound();
          setTimeout(() => {
            // Next level
            setLevel(l => l + 1);
            setStepsTaken(0);
            setCurrentPlayer(p => p === 'chick' ? 'cat' : 'chick');
            chickAnim.setValue(0);
            catAnim.setValue(0);
            pickNewLetter();
          }, 2000);
        } else {
          pickNewLetter();
        }
      });
    } else {
      playWrongSound();
    }
  };

  return (
    <View style={styles.container}>
      <GameHeader title="Find Each Other" />
      
      <LinearGradient colors={['#87CEEB', '#B0E0E6']} style={styles.sky}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.instruction}>
            {currentPlayer === 'chick' ? "Help the chick!" : "Help the cat!"}
          </Text>
        </View>

        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>Find</Text>
          <View style={styles.targetLetterBox}>
            <Text style={styles.targetLetterText}>{targetLetter}</Text>
          </View>
        </View>

        <View style={styles.ground}>
          <Animated.View style={[
            styles.character, 
            { left: 20, transform: [{ translateX: chickAnim }, { translateY: currentPlayer === 'chick' ? bounceAnim : 0 }] }
          ]}>
            <Text style={styles.emoji}>🐥</Text>
          </Animated.View>
          
          {stepsTaken >= totalSteps && (
            <View style={styles.heartContainer}>
              <Text style={styles.emoji}>❤️</Text>
            </View>
          )}

          <Animated.View style={[
            styles.character, 
            { right: 20, transform: [{ translateX: Animated.multiply(catAnim, -1) }, { translateY: currentPlayer === 'cat' ? bounceAnim : 0 }] }
          ]}>
            <Text style={styles.emoji}>🐱</Text>
          </Animated.View>
        </View>
      </LinearGradient>

      <VirtualKeyboard onKeyPress={handleKeyPress} disabled={isAnimating || stepsTaken >= totalSteps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sky: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  levelInfo: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  instruction: {
    fontSize: 18,
    color: '#334155',
    marginTop: 4,
  },
  promptContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 10,
  },
  targetLetterBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4ade80',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  targetLetterText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#3b82f6',
  },
  ground: {
    height: 150,
    backgroundColor: '#4ade80',
    borderTopWidth: 8,
    borderTopColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  character: {
    position: 'absolute',
    bottom: 20,
  },
  emoji: {
    fontSize: 64,
  },
  heartContainer: {
    position: 'absolute',
    bottom: 60,
    left: width / 2 - 32,
  }
});
