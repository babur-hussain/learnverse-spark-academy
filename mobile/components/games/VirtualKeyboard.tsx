import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { Typography, Palette, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  disabled?: boolean;
  activeLetters?: string[]; // If provided, only these letters are interactable or highlighted
  highlightedLetter?: string;
  layout?: string[][];
}

const DEFAULT_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
];

const Key = ({
  letter,
  onPress,
  disabled,
  highlighted
}: {
  letter: string;
  onPress: (l: string) => void;
  disabled: boolean;
  highlighted: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 12,
    }).start();
  };

  const handlePress = () => {
    if (!disabled) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress(letter);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.key,
          disabled && styles.keyDisabled,
          highlighted && styles.keyHighlighted
        ]}
      >
        <Text style={[
          styles.keyText,
          disabled && styles.keyTextDisabled,
          highlighted && styles.keyTextHighlighted
        ]}>
          {letter}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function VirtualKeyboard({
  onKeyPress,
  disabled = false,
  activeLetters,
  highlightedLetter,
  layout = DEFAULT_LAYOUT
}: VirtualKeyboardProps) {
  return (
    <View style={styles.container}>
      {layout.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key) => {
            const isKeyDisabled = disabled || (activeLetters && !activeLetters.includes(key));
            const isHighlighted = highlightedLetter === key;

            return (
              <Key
                key={key}
                letter={key}
                onPress={onKeyPress}
                disabled={!!isKeyDisabled}
                highlighted={isHighlighted}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const keyMargin = isTablet ? 6 : 4;
const keyWidth = Math.min((width - 40) / 10 - keyMargin * 2, isTablet ? 60 : 45);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 10,
    ...Shadow.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: keyMargin * 2,
  },
  key: {
    width: keyWidth,
    height: keyWidth * 1.2,
    marginHorizontal: keyMargin,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#e2e8f0',
    ...Shadow.sm,
  },
  keyDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    opacity: 0.6,
  },
  keyHighlighted: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  keyText: {
    fontSize: isTablet ? 28 : 22,
    fontWeight: 'bold',
    color: '#334155',
  },
  keyTextDisabled: {
    color: '#94a3b8',
  },
  keyTextHighlighted: {
    color: '#fff',
  },
});
