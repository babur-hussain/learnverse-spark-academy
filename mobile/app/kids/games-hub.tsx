import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Spacing, Typography, Shadow, BorderRadius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GAMES = [
  {
    id: 'find-each-other',
    title: 'Find Each Other',
    description: 'Help the chick and cat reunite by finding the correct letters!',
    icon: 'search',
    colors: ['#f472b6', '#a855f7'],
    emoji: '🐱🐥',
  },
  {
    id: 'keyboard-puzzle',
    title: 'Keyboard Puzzle',
    description: 'Press keys to magically reveal hidden animal pictures!',
    icon: 'keypad',
    colors: ['#4ade80', '#3b82f6'],
    emoji: '🧩🐘',
  },
  {
    id: 'letter-jump',
    title: 'Letter Jump',
    description: 'Make the chick jump across words to learn spelling!',
    icon: 'arrow-up-circle',
    colors: ['#fbbf24', '#ea580c'],
    emoji: '🐥🔤',
  },
];

export default function GamesHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.title}>Game Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Let's Play & Learn!</Text>
          <Text style={styles.heroSubtitle}>Select a game below to start your adventure.</Text>
        </View>

        <View style={styles.cardsContainer}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              activeOpacity={0.9}
              style={[styles.cardWrapper, Shadow.md]}
              onPress={() => router.push({
                pathname: '/kids/game-player' as any,
                params: { gameId: game.id, title: game.title }
              })}
            >
              <LinearGradient
                colors={game.colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={game.icon as any} size={28} color={game.colors[0]} />
                  </View>
                  <Text style={styles.emoji}>{game.emoji}</Text>
                </View>

                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardDescription}>{game.description}</Text>

                <View style={styles.playBtn}>
                  <Text style={styles.playBtnText}>Play Now</Text>
                  <Ionicons name="play" size={16} color={game.colors[1]} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    // paddingTop handled via inline style with insets.top
    paddingBottom: 16,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
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
  title: {
    ...Typography.h3,
    color: '#334155',
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: Spacing['2xl'],
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  heroSubtitle: {
    ...Typography.body,
    color: '#64748b',
  },
  cardsContainer: {
    gap: Spacing.xl,
  },
  cardWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.xl,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  playBtnText: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
});
