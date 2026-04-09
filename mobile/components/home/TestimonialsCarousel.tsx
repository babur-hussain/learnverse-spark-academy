import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { Palette, BorderRadius, Typography, Shadow, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 80;

const TESTIMONIALS = [
  { id: '1', name: 'Priya Sharma', role: 'Class 10 Student', text: 'LearnVerse made studying so much fun! The interactive lessons helped me score better in my exams.', rating: 5 },
  { id: '2', name: 'Rahul Kumar', role: 'College Student', text: 'The personalized learning paths are amazing. I love how the app adapts to my learning pace.', rating: 5 },
  { id: '3', name: 'Anita Gupta', role: 'Parent', text: 'My kids enjoy the Kids Corner section. It keeps them engaged while learning important concepts.', rating: 4 },
  { id: '4', name: 'Vikash Singh', role: 'Class 12 Student', text: 'The live classes feature is fantastic for clearing doubts. Highly recommend!', rating: 5 },
];

const TestimonialsCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <SectionHeader title="What Students Say" subtitle="Real stories, real success" />
      <Animated.FlatList
        horizontal
        data={TESTIMONIALS}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadow.md]}>
            <View style={styles.quoteRow}>
              <Ionicons name="chatbubble-ellipses" size={24} color={Palette.primary} />
              <View style={styles.stars}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#fbbf24" />
                ))}
              </View>
            </View>
            <Text style={styles.testimonialText}>"{item.text}"</Text>
            <View style={styles.author}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{item.name}</Text>
                <Text style={styles.authorRole}>{item.role}</Text>
              </View>
            </View>
          </View>
        )}
      />
      {/* Dots indicator */}
      <View style={styles.dots}>
        {TESTIMONIALS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing['2xl'],
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Palette.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginRight: Spacing.lg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    ...Typography.body,
    color: Palette.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  authorName: {
    ...Typography.bodyBold,
    color: Palette.textPrimary,
    fontSize: 14,
  },
  authorRole: {
    ...Typography.small,
    color: Palette.textMuted,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.bgCardElevated,
  },
  dotActive: {
    backgroundColor: Palette.primary,
    width: 20,
  },
});

export default TestimonialsCarousel;
