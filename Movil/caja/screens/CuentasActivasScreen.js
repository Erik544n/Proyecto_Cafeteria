import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, Switch, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import OrderCard from '../components/OrderCard';
import { colors, spacing } from '../constants/theme';
import { getPedidos, getProductos } from '../services/api';
import { money } from '../utils/formatters';

export default function CuentasActivasScreen({ session, navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const token = session?.access_token;

  const loadData = useCallback(
    async (silent = false) => {
      if (!token) {
        navigation.goToLogin();
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);
      try {
        const [nextPedidos, productos] = await Promise.all([
          getPedidos(token),
          getProductos(token).catch(() => []),
        ]);
        setPedidos(nextPedidos || []);
        setProductMap(
          (productos || []).reduce((map, item) => {
            map[item.producto_id] = item.nombre;
            return map;
          }, {})
        );
      } catch (error) {
        Alert.alert('No se pudieron cargar las cuentas', error.message);
      } finally {
        silent ? setRefreshing(false) : setLoading(false);
      }
    },
    [navigation, token]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(() => loadData(true), 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, loadData]);

  const totalPendiente = useMemo(
    () => pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0),
    [pedidos]
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.pedido_id)}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Header
              title="Cuentas activas"
              subtitle={`Sesion: ${session?.nombre || 'Cajero'} · ${session?.rol || 'Caja'}`}
              actionLabel="Salir"
              onAction={navigation.goToLogin}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <View>
                <Text selectable style={{ color: colors.muted }}>
                  Pendiente por cobrar
                </Text>
                <Text
                  selectable
                  style={{
                    color: colors.primaryDark,
                    fontSize: 24,
                    fontWeight: '900',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {money(totalPendiente)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                <Text selectable style={{ color: colors.muted }}>
                  Auto refrescar
                </Text>
                <Switch
                  value={autoRefresh}
                  onValueChange={setAutoRefresh}
                  trackColor={{ false: colors.border, true: colors.soft }}
                  thumbColor={autoRefresh ? colors.primary : colors.surface}
                />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin pedidos pendientes"
            message="La API de Caja no devolvio pedidos en estado PENDIENTE. En cuanto exista uno, podras abrir Detalle, Procesar Pago y Ticket."
            actionLabel="Actualizar"
            onAction={() => loadData(true)}
          />
        }
        renderItem={({ item }) => (
          <OrderCard pedido={item} productMap={productMap} onPress={navigation.goToDetalle} />
        )}
      />
    </SafeAreaView>
  );
}
