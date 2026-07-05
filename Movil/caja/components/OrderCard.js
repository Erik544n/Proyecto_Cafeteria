import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { money, shortDate } from '../utils/formatters';

export default function OrderCard({ pedido, productMap, onPress }) {
  const count = pedido.detalles?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
  const resumen = (pedido.detalles || [])
    .slice(0, 2)
    .map((item) => `${item.cantidad}x ${productMap[item.producto_id] || `Producto #${item.producto_id}`}`)
    .join(' · ');

  return (
    <Pressable
      onPress={() => onPress(pedido)}
      style={({ pressed }) => ({
        padding: spacing.md,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>
            {pedido.mesa_id ? `Mesa ${pedido.mesa_id}` : 'Para llevar'}
          </Text>
          <Text selectable style={{ color: colors.muted }}>
            Pedido #{pedido.pedido_id} · {shortDate(pedido.creado_en)}
          </Text>
        </View>
        <Text
          selectable
          style={{
            color: colors.primaryDark,
            fontSize: 18,
            fontWeight: '900',
            fontVariant: ['tabular-nums'],
          }}
        >
          {money(pedido.total)}
        </Text>
      </View>
      <Text selectable numberOfLines={2} style={{ color: colors.muted, lineHeight: 20 }}>
        {resumen || 'Sin productos registrados'} · {count} pieza(s)
      </Text>
    </Pressable>
  );
}
