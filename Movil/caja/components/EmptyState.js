import React from 'react';
import { Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import Button from './Button';

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <View
      style={{
        padding: spacing.lg,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
      }}
    >
      <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
        {title}
      </Text>
      <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="ghost" onPress={onAction} />
      ) : null}
    </View>
  );
}
