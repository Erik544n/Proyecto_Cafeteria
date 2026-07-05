import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, spacing } from '../constants/theme';

export default function Header({ title, subtitle, actionLabel, onAction }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <Text selectable style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>
          {title}
        </Text>
        {actionLabel ? (
          <Pressable onPress={onAction} hitSlop={10}>
            <Text selectable style={{ color: colors.primary, fontWeight: '800' }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? (
        <Text selectable style={{ color: colors.muted, lineHeight: 21 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
