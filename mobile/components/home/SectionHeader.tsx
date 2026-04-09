import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Palette, Typography, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
  gradient?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.h2,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  actionText: {
    ...Typography.caption,
    color: Palette.primary,
  },
});

export default SectionHeader;
