import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Palette, Typography, Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Palette.bg,
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
  },
  link: {
    marginTop: Spacing['2xl'],
    paddingVertical: Spacing.lg,
  },
  linkText: {
    ...Typography.bodyBold,
    color: Palette.primary,
  },
});
