import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import Button from '../components/Button';
import Header from '../components/Header';
import { colors, radius, spacing } from '../constants/theme';
import { money, shortDate } from '../utils/formatters';

export default function TicketScreen({ ticket, navigation }) {
  const venta = ticket?.venta;
  const pedido = ticket?.pedido;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      >
        <Header
          title="Venta exitosa"
          subtitle="Ticket generado por caja"
          actionLabel="Salir"
          onAction={navigation.goToLogin}
        />

        <View style={ticketStyle}>
          <Text selectable style={{ color: colors.primaryDark, fontSize: 24, fontWeight: '900' }}>
            Ticket #{venta?.venta_id || '-'}
          </Text>
          <Text selectable style={{ color: colors.muted }}>
            Pedido #{venta?.pedido_id || '-'} · {shortDate(venta?.creado_en)}
          </Text>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <Line label="Metodo" value={venta?.metodo_pago || '-'} />
          <Line label="Subtotal" value={money(venta?.subtotal)} />
          <Line label="Descuento" value={money(venta?.descuento)} />
          <Line label="IVA" value={money(venta?.impuesto)} />
          <Line label="Total" value={money(venta?.total)} strong />
          <Line label="Pagado" value={money(venta?.monto_pagado)} />
          <Line label="Cambio" value={money(venta?.cambio)} strong />

          {pedido?.detalles?.length ? (
            <>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>
                Productos
              </Text>
              {pedido.detalles.map((item) => (
                <View
                  key={item.detalle_id}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}
                >
                  <Text selectable style={{ color: colors.muted, flex: 1 }}>
                    {item.cantidad}x Producto #{item.producto_id}
                  </Text>
                  <Text selectable style={{ color: colors.text, fontWeight: '700' }}>
                    {money(item.subtotal)}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
        </View>

        <Button title="Nueva venta" onPress={navigation.goToCuentas} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Line({ label, value, strong = false }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
      <Text selectable style={{ color: strong ? colors.text : colors.muted, fontWeight: strong ? '900' : '500' }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          color: strong ? colors.primaryDark : colors.text,
          fontWeight: strong ? '900' : '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const ticketStyle = {
  padding: spacing.lg,
  borderRadius: radius.lg,
  borderCurve: 'continuous',
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  gap: spacing.md,
};
