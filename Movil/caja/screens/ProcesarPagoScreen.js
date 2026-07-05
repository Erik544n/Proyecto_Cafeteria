import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import Button from '../components/Button';
import Header from '../components/Header';
import { colors, radius, spacing } from '../constants/theme';
import { procesarPago } from '../services/api';
import { decimal, money } from '../utils/formatters';

const METODOS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
const IVA = 0.16;

export default function ProcesarPagoScreen({ session, pedido, navigation }) {
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState('');
  const [descuento, setDescuento] = useState('0');
  const [loading, setLoading] = useState(false);

  const subtotal = Number(pedido?.total || 0);
  const descuentoNumber = decimal(descuento);
  const base = Math.max(subtotal - descuentoNumber, 0);
  const impuesto = Number((base * IVA).toFixed(2));
  const total = base + impuesto;
  const pago = decimal(montoPagado);
  const cambio = Math.max(pago - total, 0);
  const requiereEfectivo = metodo === 'EFECTIVO';

  const montoEditable = useMemo(
    () => (requiereEfectivo ? montoPagado : String(total.toFixed(2))),
    [montoPagado, requiereEfectivo, total]
  );

  const confirmar = async () => {
    if (!pedido?.pedido_id) {
      Alert.alert('Pedido no disponible', 'Regresa a cuentas activas e intenta de nuevo.');
      return;
    }

    if (descuentoNumber < 0 || descuentoNumber > subtotal) {
      Alert.alert('Descuento invalido', 'El descuento no puede ser negativo ni mayor al subtotal.');
      return;
    }

    const montoFinal = requiereEfectivo ? pago : total;
    if (montoFinal < total) {
      Alert.alert('Monto insuficiente', `El total a pagar es ${money(total)}.`);
      return;
    }

    setLoading(true);
    try {
      const venta = await procesarPago(session.access_token, {
        pedido_id: pedido.pedido_id,
        metodo_pago: metodo,
        monto_pagado: Number(montoFinal.toFixed(2)),
        descuento: Number(descuentoNumber.toFixed(2)),
      });
      Alert.alert('Venta confirmada', 'El pedido fue enviado a cocina.');
      navigation.goToTicket(venta, pedido);
    } catch (error) {
      Alert.alert('No se pudo procesar el pago', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          <Header
            title="Procesar pago"
            subtitle={`Pedido #${pedido?.pedido_id || '-'} · ${pedido?.mesa_id ? `Mesa ${pedido.mesa_id}` : 'Para llevar'}`}
            actionLabel="Volver"
            onAction={() => navigation.goToDetalle(pedido)}
          />

          <View style={cardStyle}>
            <Text selectable style={labelStyle}>
              Metodo de pago
            </Text>
            <View style={{ gap: spacing.sm }}>
              {METODOS.map((item) => (
                <Button
                  key={item}
                  title={item}
                  variant={metodo === item ? 'primary' : 'ghost'}
                  onPress={() => setMetodo(item)}
                />
              ))}
            </View>
          </View>

          <View style={cardStyle}>
            <Text selectable style={labelStyle}>
              Descuento
            </Text>
            <TextInput
              value={descuento}
              onChangeText={setDescuento}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />

            <Text selectable style={labelStyle}>
              Monto recibido
            </Text>
            <TextInput
              value={montoEditable}
              onChangeText={setMontoPagado}
              editable={requiereEfectivo}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              style={[inputStyle, !requiereEfectivo && { opacity: 0.7 }]}
            />
          </View>

          <View style={cardStyle}>
            <Line label="Subtotal" value={money(subtotal)} />
            <Line label="Descuento" value={money(descuentoNumber)} />
            <Line label="IVA 16%" value={money(impuesto)} />
            <Line label="Total" value={money(total)} strong />
            <Line label="Cambio" value={money(cambio)} strong={requiereEfectivo} />
          </View>

          <Button title="Confirmar pago" onPress={confirmar} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
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

const cardStyle = {
  padding: spacing.md,
  borderRadius: radius.md,
  borderCurve: 'continuous',
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  gap: spacing.md,
};

const labelStyle = {
  color: colors.text,
  fontWeight: '800',
};

const inputStyle = {
  minHeight: 52,
  borderRadius: radius.md,
  borderCurve: 'continuous',
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surfaceMuted,
  color: colors.text,
  paddingHorizontal: spacing.md,
  fontSize: 18,
};
