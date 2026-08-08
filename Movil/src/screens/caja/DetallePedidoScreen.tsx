import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiCajaGetPedido, apiCajaCancelarPedido } from '../../services/api';
import { CajaStackParamList } from './CuentasActivasScreen';

type DetallePedidoRouteProp = RouteProp<CajaStackParamList, 'DetallePedido'>;

export default function DetallePedidoScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<CajaStackParamList>>();
  const route = useRoute<DetallePedidoRouteProp>();
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const data = await apiCajaGetPedido(token, Number(pedidoId));
        setPedido(data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el pedido');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPedido();
  }, [pedidoId, token]);

  const handleCancel = () => {
    Alert.alert('Cancelar Pedido', '¿Estás seguro de cancelar este pedido?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: async () => {
          try {
            await apiCajaCancelarPedido(token, Number(pedidoId));
            Alert.alert('Éxito', 'Pedido cancelado correctamente');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'No se pudo cancelar el pedido');
          }
      }}
    ]);
  };

  const handlePay = () => {
    if (pedido) {
      navigation.navigate('ProcesarPago', { pedidoId: String(pedido.pedido_id), total: Number(pedido.total) });
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!pedido) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Detalle del Pedido</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Pedido #{pedido.pedido_id}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{pedido.estado}</Text></View>
            </View>
            <Text style={styles.subtitle}>{pedido.mesa_id ? `Mesa ${pedido.mesa_id}` : 'Para llevar'}</Text>
            <Text style={styles.time}>{new Date(pedido.creado_en).toLocaleString()}</Text>
          </View>

          <Text style={styles.sectionTitle}>Artículos</Text>
          <View style={styles.itemsCard}>
            {pedido.detalles?.map((item: any, index: number) => (
              <View key={item.detalle_id || index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.cantidad}x {item.producto_nombre || `Producto #${item.producto_id}`}</Text>
                  {item.observaciones && <Text style={styles.itemObs}>{item.observaciones}</Text>}
                </View>
                <View style={styles.itemPrice}>
                  <Text style={styles.itemPriceText}>${(Number(item.cantidad) * Number(item.precio_unit)).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>${Number(pedido.total).toFixed(2)}</Text>
            <Text style={styles.taxNote}>16% IVA se calcula al cobrar</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>CANCELAR PEDIDO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
            <Text style={styles.payBtnText}>PROCESAR PAGO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: Colors.background },
  backButton: { padding: 5 },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 15 },
  headerCard: { backgroundColor: Colors.surface, padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: {width: 0, height: 2} },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  badge: { backgroundColor: Colors.accentLight || '#ffebee', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Colors.accent || '#d32f2f', fontWeight: 'bold', fontSize: 12 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 5 },
  time: { fontSize: 12, color: Colors.textLight },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10, marginLeft: 5 },
  itemsCard: { backgroundColor: Colors.surface, borderRadius: 15, padding: 15, marginBottom: 20, elevation: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, color: Colors.textPrimary },
  itemObs: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  itemPrice: { marginLeft: 10, justifyContent: 'center' },
  itemPriceText: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  totalCard: { backgroundColor: Colors.primary, padding: 20, borderRadius: 15, alignItems: 'center', marginVertical: 10 },
  totalLabel: { fontSize: 16, color: Colors.surface, opacity: 0.9 },
  totalValue: { fontSize: 36, fontWeight: 'bold', color: Colors.surface, marginVertical: 5 },
  taxNote: { fontSize: 12, color: Colors.surface, opacity: 0.7 },
  footer: { flexDirection: 'row', padding: 15, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: Colors.accent, marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: Colors.accent, fontWeight: 'bold' },
  payBtn: { flex: 2, padding: 15, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  payBtnText: { color: Colors.surface, fontWeight: 'bold' }
});
