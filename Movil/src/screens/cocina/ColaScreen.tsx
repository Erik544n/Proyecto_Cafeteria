import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, SafeAreaView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { apiCocinaGetPedidos, apiCocinaPreparar, apiCocinaMarcarListo, apiCocinaGetBajoStock } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

export default function ColaScreen() {
  const navigation = useNavigation<any>();
  const { token, user, logout } = useAuth();

  const [pedidos, setPedidos] = useState<any[]>([]);
  const [bajoStockCount, setBajoStockCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [pedidosRes, bajoStockRes] = await Promise.all([
        apiCocinaGetPedidos(token),
        apiCocinaGetBajoStock(token),
      ]);
      const activePedidos = pedidosRes.filter(
        (p: any) => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION'
      );
      activePedidos.sort(
        (a: any, b: any) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()
      );
      setPedidos(activePedidos);
      setBajoStockCount(bajoStockRes.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [fetchData])
  );

  const handlePreparar = async (pedidoId: number) => {
    try {
      await apiCocinaPreparar(token, pedidoId);
      fetchData(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido.');
    }
  };

  const handleListo = async (pedidoId: number) => {
    try {
      await apiCocinaMarcarListo(token, pedidoId);
      fetchData(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido.');
    }
  };

  const pendientesCount = pedidos.filter((p) => p.estado === 'PENDIENTE').length;
  const enPreparacionCount = pedidos.filter((p) => p.estado === 'EN_PREPARACION').length;

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const renderPedidoItem = ({ item }: { item: any }) => {
    const isPendiente = item.estado === 'PENDIENTE';
    const itemsCount = item.detalles
      ? item.detalles.reduce((acc: number, det: any) => acc + det.cantidad, 0)
      : 0;

    return (
      <TouchableOpacity
        style={[styles.card, isPendiente ? styles.cardPendiente : styles.cardEnPreparacion]}
        onPress={() => navigation.navigate('DetallePedido', { pedido: item })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.pedidoId}>Pedido #{item.pedido_id}</Text>
            {item.mesa_id && (
              <View style={styles.mesaBadge}>
                <Text style={styles.mesaBadgeText}>Mesa {item.mesa_id}</Text>
              </View>
            )}
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.time}>{formatTime(item.creado_en)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={[styles.badge, isPendiente ? styles.badgePendiente : styles.badgeEnPreparacion]}>
            <Text style={[styles.badgeText, { color: isPendiente ? '#e65100' : '#bf360c' }]}>
              {item.estado.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.itemsCountBadge}>
            <Ionicons name="cube-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.itemsCountText}>{itemsCount} producto(s)</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.total}>${Number(item.total).toFixed(2)}</Text>
          {isPendiente ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnPreparar]}
              onPress={() => handlePreparar(item.pedido_id)}
            >
              <Ionicons name="flame" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.btnText}>Preparar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnListo]}
              onPress={() => handleListo(item.pedido_id)}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.btnText}>Listo</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && pedidos.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.textSecondary, fontSize: 14 }}>Cargando pedidos…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSubtitle}>Módulo Cocina</Text>
          <Text style={styles.headerTitle}>Cola de Pedidos</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.userName}>{user?.nombre?.split(' ')[0] || 'Chef'}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, styles.statPendiente]}>
          <Text style={styles.statValue}>{pendientesCount}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statBox, styles.statEnPreparacion]}>
          <Text style={styles.statValue}>{enPreparacionCount}</Text>
          <Text style={styles.statLabel}>En Preparación</Text>
        </View>
        {bajoStockCount > 0 && (
          <TouchableOpacity
            style={[styles.statBox, styles.statBajoStock]}
            onPress={() => navigation.navigate('Inventario')}
          >
            <Text style={[styles.statValue, { color: '#e53935' }]}>{bajoStockCount}</Text>
            <Text style={styles.statLabel}>Bajo Stock</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.pedido_id.toString()}
        renderItem={renderPedidoItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={56} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Sin pedidos en cola</Text>
            <Text style={styles.emptyText}>Todo está preparado. Desliza hacia abajo para actualizar.</Text>
          </View>
        }
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerSubtitle: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  logoutBtn: { padding: 4, marginLeft: 4 },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  statPendiente: { backgroundColor: '#fffbeb', borderColor: '#fbbf24' },
  statEnPreparacion: { backgroundColor: '#fff5f5', borderColor: '#fc8181' },
  statBajoStock: { backgroundColor: '#fef2f2', borderColor: '#e53935' },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  listContainer: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPendiente: { borderLeftColor: '#fbbf24' },
  cardEnPreparacion: { borderLeftColor: '#f56565' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pedidoId: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  mesaBadge: {
    backgroundColor: Colors.accent + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mesaBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
  time: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgePendiente: { backgroundColor: '#fff8e1', borderColor: '#ffb300' },
  badgeEnPreparacion: { backgroundColor: '#fff3e0', borderColor: '#ff6f00' },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  itemsCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f5f0eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  itemsCountText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0ebe5',
    paddingTop: 12,
  },
  total: { fontSize: 17, fontWeight: '900', color: Colors.primary },
  actionBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPreparar: { backgroundColor: '#f59e0b' },
  btnListo: { backgroundColor: '#16a34a' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 12, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
