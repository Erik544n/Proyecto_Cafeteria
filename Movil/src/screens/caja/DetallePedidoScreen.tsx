import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CajaStackParamList } from '../../navigation/CajaNavigator';

type DetallePedidoRouteProp = RouteProp<CajaStackParamList, 'DetallePedido'>;
type CajaNavigationProp = NativeStackNavigationProp<CajaStackParamList, 'DetallePedido'>;

// Mock data (simulando respuesta de API)
const MOCK_PEDIDO_DETALLE = {
  id: '101',
  mesa: '04',
  mesero: 'Juan P.',
  fecha: new Date().toISOString(),
  estado: 'POR_COBRAR',
  observaciones: 'Cliente solicito cuenta dividida',
  total: 155,
  productos: [
    { id: '1', nombre: 'Flat White', cantidad: 1, precio_unit: 68, subtotal: 68 },
    { id: '2', nombre: 'Toast de Aguacate', cantidad: 1, precio_unit: 115, subtotal: 115, observaciones: 'Sin cebolla' },
  ]
};

export default function DetallePedidoScreen() {
  const navigation = useNavigation<CajaNavigationProp>();
  const route = useRoute<DetallePedidoRouteProp>();
  const { pedidoId } = route.params;

  // En la implementacion real, hariamos fetch con pedidoId
  const [pedido] = useState(MOCK_PEDIDO_DETALLE);
  const [canceling, setCanceling] = useState(false);

  const handleCancel = () => {
    Alert.alert('Cancelar pedido', 'Esta accion marcara el pedido como CANCELADO permanentemente.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Cancelar pedido',
        style: 'destructive',
        onPress: () => {
          setCanceling(true);
          setTimeout(() => {
            setCanceling(false);
            Alert.alert('Pedido cancelado', 'La cuenta fue cancelada correctamente.');
            navigation.goBack();
          }, 1000);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header Premium */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backEmoji}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>Mesa {pedido.mesa} · {pedido.estado}</Text>
          <Text style={styles.headerTitle}>Pedido #{pedidoId}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total del pedido</Text>
          <Text style={styles.totalAmount}>${pedido.total.toFixed(2)} MXN</Text>
          {pedido.observaciones ? (
            <View style={styles.obsContainer}>
              <Text style={styles.obsEmoji}>💬</Text>
              <Text style={styles.obsText}>{pedido.observaciones}</Text>
            </View>
          ) : null}
        </View>

        {/* Productos */}
        <Text style={styles.sectionTitle}>Productos Consumidos</Text>
        
        {pedido.productos.map((item, index) => (
          <View key={index} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.productMeta}>
                {item.cantidad} x ${item.precio_unit.toFixed(2)}
              </Text>
              {item.observaciones ? (
                <Text style={styles.productObs}>* {item.observaciones}</Text>
              ) : null}
            </View>
            <Text style={styles.productSubtotal}>${item.subtotal.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.payBtn}
            onPress={() => navigation.navigate('ProcesarPago', { pedidoId, total: pedido.total })}
          >
            <Text style={styles.payBtnText}>PROCESAR PAGO</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={canceling}
          >
            <Text style={styles.cancelBtnText}>{canceling ? 'CANCELANDO...' : 'CANCELAR PEDIDO'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Aumentamos el margen superior para que no se superponga con la hora
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backEmoji: {
    fontSize: 20,
    color: '#000',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  totalCard: {
    backgroundColor: Colors.accentLight, // Color clarito (dorado suave)
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  totalLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.8,
  },
  totalAmount: {
    color: Colors.primary,
    fontSize: 40,
    fontWeight: '900',
  },
  obsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  obsEmoji: {
    marginRight: 8,
  },
  obsText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  productMeta: {
    color: Colors.textLight,
    fontSize: 13,
  },
  productObs: {
    color: Colors.danger || '#dc2626',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  productSubtotal: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  actionsContainer: {
    marginTop: 32,
    gap: 16,
  },
  payBtn: {
    backgroundColor: Colors.primary, // Mantenemos el café oscuro, pero con texto blanco
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFF', // Texto blanco para que contraste con el café oscuro
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger || '#dc2626',
  },
  cancelBtnText: {
    color: Colors.danger || '#dc2626',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
