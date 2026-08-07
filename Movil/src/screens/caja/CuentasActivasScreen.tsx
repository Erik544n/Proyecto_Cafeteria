import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Switch, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CajaStackParamList } from '../../navigation/CajaNavigator';
import { useAuth } from '../../context/AuthContext';

type CajaNavigationProp = NativeStackNavigationProp<CajaStackParamList, 'CuentasActivas'>;

// Mock data para pedidos pendientes de cobro
const MOCK_PEDIDOS_CAJA = [
  { id: '101', mesa: '04', mesero: 'Juan P.', total: 155, estado: 'POR_COBRAR', fecha: new Date().toISOString() },
  { id: '102', mesa: '08', mesero: 'Maria L.', total: 85, estado: 'POR_COBRAR', fecha: new Date().toISOString() },
];

export default function CuentasActivasScreen() {
  const navigation = useNavigation<CajaNavigationProp>();
  const { role, logout } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pedidos, setPedidos] = useState(MOCK_PEDIDOS_CAJA);

  const totalPendiente = pedidos.reduce((sum, ped) => sum + ped.total, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header Premium */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>BrewMaster Ops - CAJA</Text>
          <Text style={styles.headerTitle}>Cuentas Activas</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutEmoji}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Pendiente por cobrar</Text>
            <Text style={styles.summaryAmount}>${totalPendiente.toFixed(2)} MXN</Text>
          </View>
          <View style={styles.refreshControl}>
            <Text style={styles.refreshLabel}>Auto refrescar</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={autoRefresh ? '#FFF' : '#AAA'}
            />
          </View>
        </View>

        {/* Lista de Pedidos */}
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DetallePedido', { pedidoId: item.id })}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderId}>#{item.id}</Text>
                  <Text style={styles.orderTime}>Hace 5 min</Text>
                </View>
                <View style={styles.tableBadge}>
                  <Text style={styles.tableBadgeText}>Mesa {item.mesa}</Text>
                </View>
              </View>
              
              <View style={styles.orderDivider} />
              
              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.meseroText}>Atendió: {item.mesero}</Text>
                </View>
                <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerSubtitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutEmoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryLabel: {
    color: Colors.textLight,
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryAmount: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  refreshControl: {
    alignItems: 'flex-end',
  },
  refreshLabel: {
    color: Colors.textLight,
    fontSize: 12,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 40,
    gap: 16,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  orderTime: {
    color: Colors.textLight,
    fontSize: 12,
  },
  tableBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tableBadgeText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  orderDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  meseroText: {
    color: Colors.textLight,
    fontSize: 13,
  },
  orderTotal: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
});
