import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GameHeader from '@/components/games/GameHeader';
import VirtualKeyboard from '@/components/games/VirtualKeyboard';
import { playLetterSound, playWordSound, playSuccessSound, playWrongSound, playJumpSound } from '@/utils/sound';

const { width } = Dimensions.get('window');

const WORDS = [
  "CAT", "DOG", "SUN", "HAT", "BAT", "PIG", "COW", "HEN", "BEE", "ANT",
  "OWL", "FOX", "BOX", "TOY", "JOY", "BOY", "CUP", "MUG", "RUG", "BUG"
];

export default function LetterJumpScreen() {
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const jumpAnimX = useRef(new Animated.Value(0)).current;
  const jumpAnimY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    pickNewWord();
  }, [level]);

  const pickNewWord = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setCurrentLetterIndex(0);
    jumpAnimX.setValue(0);
    jumpAnimY.setValue(0);
    scaleAnim.setValue(1);
    
    // Announce the word
    setTimeout(() => playWordSound(word), 500);
    // Announce the first letter
    setTimeout(() => playLetterSound(word[0]), 1500);
  };

  const handleKeyPress = (key: string) => {
    if (isAnimating || currentLetterIndex >= currentWord.length) return;

    const expectedLetter = currentWord[currentLetterIndex];
    
    if (key === expectedLetter) {
      setIsAnimating(true);
      playJumpSound();
      
      const newIndex = currentLetterIndex + 1;
      
      // Calculate jump targets based on word length and screen width
      const lettersContainerWidth = width - 40;
      const letterSpace = lettersContainerWidth / currentWord.length;
      const targetX = newIndex * letterSpace;

      // Animate jump arc
      Animated.parallel([
        Animated.timing(jumpAnimX, {
          toValue: targetX,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.sequence([
          Animated.timing(jumpAnimY, {
            toValue: -100, // Jump height
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad)
          }),
          Animated.timing(jumpAnimY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.in(Easing.quad)
          })
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        setIsAnimating(false);
        setCurrentLetterIndex(newIndex);
        
        if (newIndex >= currentWord.length) {
          playSuccessSound();
          setTimeout(() => {
            setLevel(l => l + 1);
          }, 2000);
        } else {
          // Play next letter sound
          playLetterSound(currentWord[newIndex]);
        }
      });
    } else {
      playWrongSound();
    }
  };

  const lettersContainerWidth = width - 40;
  const letterSpace = lettersContainerWidth / Math.max(currentWord.length, 1);

  return (
    <View style={styles.container}>
      <GameHeader title="Letter Jump" />
      
      <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.world}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Level {level}</Text>
          <Text style={styles.instruction}>Spell the word!</Text>
        </View>

        <View style={styles.wordContainer}>
          <Text style={styles.wordDisplay}>{currentWord}</Text>
        </View>

        <View style={styles.platformContainer}>
          <View style={[styles.lettersRow, { width: lettersContainerWidth }]}>
            {currentWord.split('').map((char, index) => (
              <View key={index} style={[styles.letterPlatform, { width: letterSpace }]}>
                <View style={[
                  styles.letterBlock, 
                  index < currentLetterIndex ? styles.letterBlockPassed : null,
                  index === currentLetterIndex ? styles.letterBlockActive : null
                ]}>
                  <Text style={[
                    styles.letterText,
                    index < currentLetterIndex ? styles.letterTextPassed : null
                  ]}>{char}</Text>
                </View>
              </View>
            ))}
          </View>

          <Animated.View style={[
            styles.character,
            { 
              transform: [
                { translateX: jumpAnimX },
                { translateY: jumpAnimY },
                { scale: scaleAnim }
              ],
              left: 20 + (letterSpace / 2) - 30 // Center over first block
            }
          ]}>
            <Text style={styles.emoji}>🐥</Text>
          </Animated.View>
        </View>
      </LinearGradient>

      <VirtualKeyboard onKeyPress={handleKeyPress} disabled={isAnimating || currentLetterIndex >= currentWord.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  world: {
    flex: 1,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  infoBox: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instruction: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  wordContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  wordDisplay: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  platformContainer: {
    height: 250,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  lettersRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    height: 80,
  },
  letterPlatform: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  letterBlock: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderColor: '#e2e8f0',
  },
  letterBlockActive: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    borderBottomWidth: 5,
    transform: [{ translateY: -10 }],
  },
  letterBlockPassed: {
    backgroundColor: '#4ade80',
    borderColor: '#22c55e',
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  letterTextPassed: {
    color: '#fff',
  },
  character: {
    position: 'absolute',
    bottom: 90, // Above the letter blocks
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 50,
  }
});
