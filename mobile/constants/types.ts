import { ColorValue } from 'react-native';

/**
 * Gradient colors type for expo-linear-gradient
 * Must be a tuple of at least 2 ColorValue items
 */
export type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

/**
 * Helper to cast an array of strings to GradientColors
 */
export function gradientColors(...colors: [string, string, ...string[]]): GradientColors {
  return colors as unknown as GradientColors;
}
