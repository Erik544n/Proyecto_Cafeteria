import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiCajaVentasHoy, apiCajaGetTicket } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function HistorialVentasScreen() {
  const { token, user } = useAuth();
  const navigation = useNavigation<any>();
  const [ventas, setVentas] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const data = await apiCajaVentasHoy(token);
      setVentas(data.ventas || []);
      setResumen({
        total_ventas: data.total_ventas,
        total_dia: data.total_dia,
        fecha: data.fecha
      });
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
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleVerTicket = async (ventaId: number) => {
    try {
      const ticketData = await apiCajaGetTicket(token!, ventaId);
      navigation.navigate('Ticket', { ticketData });
    } catch (error) {
      console.error("Error obteniendo ticket", error);
    }
  };

  const renderVenta = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleVerTicket(item.venta_id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Venta V-{item.venta_id}</Text>
        <Text style={styles.cardMethod}>{item.metodo_pago}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>Pedido #{item.pedido_id}</Text>
        <Text style={styles.totalText}>${Number(item.total).toFixed(2)}</Text>
      </View>
      <Text style={styles.cardTime}>{new Date(item.creado_en).toLocaleTimeString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Cobros</Text>
        <Text style={styles.headerSubtitle}>Ventas de Hoy</Text>
      </View>
      
      {resumen && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tickets Cobrados</Text>
              <Text style={styles.summaryValue}>{resumen.total_ventas}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={styles.summaryValue}>${Number(resumen.total_dia).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={ventas}
          keyExtractor={item => String(item.venta_id)}
          renderItem={renderVenta}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Aún no hay ventas cobradas hoy</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: Colors.primary },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.surface },
  headerSubtitle: { fontSize: 14, color: Colors.accentLight, marginTop: 4 },
  summaryCard: { backgroundColor: Colors.surface, margin: 15, padding: 15, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: { backgroundColor: Colors.surface, padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  cardMethod: { fontSize: 12, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardText: { fontSize: 14, color: Colors.textSecondary },
  totalText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  cardTime: { fontSize: 12, color: Colors.textLight, textAlign: 'right' },
  loader: { marginTop: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', marginTop: 15, color: Colors.textSecondary, fontSize: 16 }
});
