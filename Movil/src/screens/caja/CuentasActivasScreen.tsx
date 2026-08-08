import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiCajaGetPedidos, apiCajaVentasHoy } from '../../services/api';

export type CajaStackParamList = {
  CuentasActivas: undefined;
  DetallePedido: { pedidoId: string };
  ProcesarPago: { pedidoId: string; total: number };
  Ticket: { ticketData: any };
};

export default function CuentasActivasScreen() {
  const { token, user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<CajaStackParamList>>();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [ventasHoy, setVentasHoy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [pedidosData, ventasData] = await Promise.all([
        apiCajaGetPedidos(token),
        apiCajaVentasHoy(token)
      ]);
      setPedidos(pedidosData || []);
      setVentasHoy(ventasData || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const interval = setInterval(() => {
        fetchData();
      }, 20000);
      return () => clearInterval(interval);
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderPedido = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('DetallePedido', { pedidoId: String(item.pedido_id) })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Pedido #{item.pedido_id}</Text>
        <Text style={styles.cardMesa}>{item.mesa_id ? `Mesa ${item.mesa_id}` : 'Para llevar'}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>Total: <Text style={styles.totalText}>${Number(item.total).toFixed(2)}</Text></Text>
        <Text style={styles.cardTextSecondary}>Items: {item.detalles?.length || 0}</Text>
      </View>
      <Text style={styles.cardTime}>{new Date(item.creado_en).toLocaleTimeString()}</Text>
    </TouchableOpacity>
  );

  const totalPendingAmount = pedidos.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Caja</Text>
          <Text style={styles.headerSubtitle}>Hola, {user?.nombre || 'Usuario'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Órdenes Pend.</Text>
            <Text style={styles.summaryValue}>{pedidos.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Monto Pend.</Text>
            <Text style={styles.summaryValue}>${totalPendingAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ventas de Hoy</Text>
            <Text style={styles.summaryValue}>${Number(ventasHoy?.total_dia || 0).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Órdenes por Cobrar</Text>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={item => String(item.pedido_id)}
          renderItem={renderPedido}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay órdenes pendientes</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: Colors.primary },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.surface },
  headerSubtitle: { fontSize: 14, color: Colors.textLight },
  logoutBtn: { backgroundColor: Colors.accent, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: Colors.surface, fontWeight: 'bold' },
  summaryCard: { backgroundColor: Colors.surface, margin: 15, padding: 15, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginHorizontal: 15, marginVertical: 10 },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: { backgroundColor: Colors.surface, padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3, borderLeftWidth: 4, borderLeftColor: Colors.accent },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  cardMesa: { fontSize: 14, color: Colors.textSecondary },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardText: { fontSize: 14, color: Colors.textSecondary },
  totalText: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  cardTextSecondary: { fontSize: 12, color: Colors.textLight },
  cardTime: { fontSize: 12, color: Colors.textLight, textAlign: 'right' },
  loader: { marginTop: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: Colors.textSecondary, fontSize: 16 }
});
