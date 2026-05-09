import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import GameHeader from '@/components/games/GameHeader';
import VirtualKeyboard from '@/components/games/VirtualKeyboard';
import { playLetterSound, playSuccessSound, playWrongSound } from '@/utils/sound';

const { width } = Dimensions.get('window');
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

const IMAGES = [
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&h=640&fit=crop', // Lion
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=640&fit=crop', // Panda
  'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&h=640&fit=crop', // Elephant
];

const COLS = 6;
const ROWS = 4;
const TOTAL_TILES = COLS * ROWS;

interface Tile {
  id: number;
  letter: string;
  revealed: boolean;
  anim: Animated.Value;
}

export default function KeyboardPuzzleScreen() {
  const [level, setLevel] = useState(1);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [targetLetter, setTargetLetter] = useState<string>('');

  useEffect(() => {
    initLevel();
  }, [level]);

  const initLevel = () => {
    // Generate tiles
    const newTiles: Tile[] = [];
    let pool = [...CHARACTERS].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < TOTAL_TILES; i++) {
      newTiles.push({
        id: i,
        letter: pool[i % pool.length],
        revealed: false,
        anim: new Animated.Value(1),
      });
    }
    
    setTiles(newTiles);
    setCurrentImageIndex((level - 1) % IMAGES.length);
    pickNextTarget(newTiles);
  };

  const pickNextTarget = (currentTiles: Tile[]) => {
    const hiddenTiles = currentTiles.filter(t => !t.revealed);
    if (hiddenTiles.length > 0) {
      const nextTile = hiddenTiles[Math.floor(Math.random() * hiddenTiles.length)];
      setTargetLetter(nextTile.letter);
      playLetterSound(nextTile.letter);
    } else {
      // Level complete
      playSuccessSound();
      setTimeout(() => {
        setLevel(l => l + 1);
      }, 2500);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === targetLetter) {
      const updatedTiles = [...tiles];
      // Reveal all tiles with this letter
      let revealedAny = false;
      updatedTiles.forEach(tile => {
        if (tile.letter === key && !tile.revealed) {
          tile.revealed = true;
          revealedAny = true;
          Animated.timing(tile.anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }
      });
      
      if (revealedAny) {
        setTiles(updatedTiles);
        pickNextTarget(updatedTiles);
      }
    } else {
      playWrongSound();
    }
  };

  const puzzleWidth = width - 40;
  const tileWidth = puzzleWidth / COLS;
  const tileHeight = puzzleWidth * 0.8 / ROWS;

  return (
    <View style={styles.container}>
      <GameHeader title="Keyboard Puzzle" />
      
      <View style={styles.content}>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>Find the letter:</Text>
          <Text style={styles.targetLetter}>{targetLetter}</Text>
        </View>

        <View style={[styles.puzzleContainer, { width: puzzleWidth, height: puzzleWidth * 0.8 }]}>
          <Image 
            source={{ uri: IMAGES[currentImageIndex] }} 
            style={StyleSheet.absoluteFillObject} 
            contentFit="cover"
            transition={500}
          />
          
          <View style={styles.grid}>
            {tiles.map((tile) => (
              <Animated.View 
                key={tile.id} 
                style={[
                  styles.tile, 
                  { 
                    width: tileWidth, 
                    height: tileHeight,
                    opacity: tile.anim,
                    transform: [
                      { scale: tile.anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }
                    ]
                  }
                ]}
              >
                <Text style={styles.tileLetter}>{tile.letter}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </View>

      <VirtualKeyboard onKeyPress={handleKeyPress} highlightedLetter={targetLetter} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 24,
    color: '#334155',
    fontWeight: '600',
    marginRight: 10,
  },
  targetLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#eab308',
  },
  puzzleContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  }
});
