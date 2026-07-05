import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}) {
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  const backgroundColor = isGhost
    ? 'transparent'
    : isDanger
      ? colors.danger
      : colors.primary;
  const textColor = isGhost ? colors.primary : colors.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        backgroundColor,
        borderWidth: isGhost ? 1 : 0,
        borderColor: colors.border,
        opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          selectable
          style={{ color: textColor, fontSize: 16, fontWeight: '700' }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
