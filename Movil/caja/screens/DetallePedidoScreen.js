import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, SectionList, Text, View } from 'react-native';

import Button from '../components/Button';
import Header from '../components/Header';
import { colors, radius, spacing } from '../constants/theme';
import { cancelarPedido, getPedido, getProductos } from '../services/api';
import { money, shortDate } from '../utils/formatters';

export default function DetallePedidoScreen({ session, pedido, navigation }) {
  const [detalle, setDetalle] = useState(pedido);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const token = session?.access_token;

  const loadDetalle = useCallback(async () => {
    if (!pedido?.pedido_id || !token) {
      navigation.goToCuentas();
      return;
    }

    setLoading(true);
    try {
      const [nextDetalle, productos] = await Promise.all([
        getPedido(token, pedido.pedido_id),
        getProductos(token).catch(() => []),
      ]);
      setDetalle(nextDetalle);
      setProductMap(
        (productos || []).reduce((map, item) => {
          map[item.producto_id] = item.nombre;
          return map;
        }, {})
      );
    } catch (error) {
      Alert.alert('No se pudo cargar el pedido', error.message);
    } finally {
      setLoading(false);
    }
  }, [navigation, pedido?.pedido_id, token]);

  useEffect(() => {
    loadDetalle();
  }, [loadDetalle]);

  const sections = useMemo(
    () => [
      {
        title: 'Productos',
        data: detalle?.detalles || [],
      },
    ],
    [detalle?.detalles]
  );

  const handleCancel = () => {
    Alert.alert('Cancelar pedido', 'Esta accion marcara el pedido como CANCELADO.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar pedido',
        style: 'destructive',
        onPress: async () => {
          setCanceling(true);
          try {
            await cancelarPedido(token, detalle.pedido_id);
            Alert.alert('Pedido cancelado', 'La cuenta fue cancelada correctamente.');
            navigation.goToCuentas();
          } catch (error) {
            Alert.alert('No se pudo cancelar', error.message);
          } finally {
            setCanceling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.detalle_id)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Header
              title={`Pedido #${detalle.pedido_id}`}
              subtitle={`${detalle.mesa_id ? `Mesa ${detalle.mesa_id}` : 'Para llevar'} · ${shortDate(detalle.creado_en)} · ${detalle.estado}`}
              actionLabel="Volver"
              onAction={navigation.goToCuentas}
            />
            <View style={summaryStyle}>
              <Text selectable style={{ color: colors.muted }}>
                Total del pedido
              </Text>
              <Text selectable style={totalStyle}>
                {money(detalle.total)}
              </Text>
              {detalle.observaciones ? (
                <Text selectable style={{ color: colors.muted, lineHeight: 20 }}>
                  {detalle.observaciones}
                </Text>
              ) : null}
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: '900' }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={rowStyle}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ color: colors.text, fontWeight: '800' }}>
                {productMap[item.producto_id] || `Producto #${item.producto_id}`}
              </Text>
              <Text selectable style={{ color: colors.muted }}>
                {item.cantidad} x {money(item.precio_unit)}
              </Text>
              {item.observaciones ? (
                <Text selectable style={{ color: colors.muted }}>
                  {item.observaciones}
                </Text>
              ) : null}
            </View>
            <Text selectable style={{ color: colors.text, fontWeight: '900' }}>
              {money(item.subtotal)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
            <Button title="Procesar pago" onPress={() => navigation.goToPago(detalle)} />
            <Button
              title="Cancelar pedido"
              variant="danger"
              onPress={handleCancel}
              loading={canceling}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const summaryStyle = {
  padding: spacing.md,
  borderRadius: radius.md,
  borderCurve: 'continuous',
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  gap: spacing.xs,
};

const totalStyle = {
  color: colors.primaryDark,
  fontSize: 30,
  fontWeight: '900',
  fontVariant: ['tabular-nums'],
};

const rowStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: spacing.md,
  padding: spacing.md,
  borderRadius: radius.md,
  borderCurve: 'continuous',
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
};
