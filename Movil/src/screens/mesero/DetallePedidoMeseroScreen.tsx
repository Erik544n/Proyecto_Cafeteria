import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiEntregarPedido } from '../../services/api';

interface Detalle {
  detalle_id: number;
  producto_id: number;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
  observaciones?: string;
  producto_nombre?: string;
}

interface Pedido {
  pedido_id: number;
  mesa_id?: number;
  usuario_id: number;
  estado: string;
  observaciones?: string;
  total: number;
  creado_en: string;
  detalles: Detalle[];
}

type PedidosStackParamList = {
  PedidosList: undefined;
  DetallePedidoMesero: { pedido: Pedido };
};

type RouteType = RouteProp<PedidosStackParamList, 'DetallePedidoMesero'>;

const ESTADO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDIENTE:       { bg: '#fff8e1', text: '#e65100', border: '#ffb300' },
  EN_PREPARACION:  { bg: '#fff3e0', text: '#bf360c', border: '#ff6f00' },
  LISTO:           { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' },
  ENTREGADO:       { bg: '#e3f2fd', text: '#0d47a1', border: '#1976d2' },
  CANCELADO:       { bg: '#fce4ec', text: '#b71c1c', border: '#e53935' },
};

function formatFecha(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export default function DetallePedidoMeseroScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { token } = useAuth();
  const [pedido, setPedido] = useState<Pedido>(route.params.pedido);
  const [entregando, setEntregando] = useState(false);

  const estadoStyle = ESTADO_COLORS[pedido.estado] ?? { bg: '#f5f5f5', text: '#666', border: '#ccc' };

  const handleMarcarEntregado = async () => {
    if (!token) return;
    Alert.alert(
      'Confirmar entrega',
      `¿Confirmas que el pedido #${pedido.pedido_id} fue entregado a la Mesa ${pedido.mesa_id ?? 'N/A'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Entregado',
          onPress: async () => {
            setEntregando(true);
            try {
              await apiEntregarPedido(token, pedido.pedido_id);
              setPedido((prev) => ({ ...prev, estado: 'ENTREGADO' }));
              Alert.alert('¡Entregado!', `El pedido #${pedido.pedido_id} ha sido completado.`);
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'No se pudo actualizar el pedido.');
            } finally {
              setEntregando(false);
            }
          },
        },
      ]
    );
  };

  const totalItems = pedido.detalles.reduce((acc, d) => acc + d.cantidad, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Pedidos</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedido #{pedido.pedido_id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>MESA</Text>
              <Text style={styles.summaryValue}>
                {pedido.mesa_id ? `Mesa ${pedido.mesa_id}` : 'Para Llevar'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>ESTADO</Text>
              <View style={[styles.estadoBadge, { backgroundColor: estadoStyle.bg, borderColor: estadoStyle.border }]}>
                <Text style={[styles.estadoText, { color: estadoStyle.text }]}>
                  {pedido.estado.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>HORA DE REGISTRO</Text>
              <Text style={styles.summarySub}>{formatFecha(pedido.creado_en)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>CANTIDAD TOTAL</Text>
              <Text style={styles.summarySub}>{totalItems} producto(s)</Text>
            </View>
          </View>
        </View>

        {/* Botón de acción rápido si está LISTO */}
        {pedido.estado === 'LISTO' && (
          <TouchableOpacity
            style={styles.btnEntregar}
            onPress={handleMarcarEntregado}
            disabled={entregando}
            activeOpacity={0.85}
          >
            {entregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnEntregarText}>MARCAR COMO ENTREGADO</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Lista de productos */}
        <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS</Text>

        <View style={styles.productsList}>
          {pedido.detalles.map((d, index) => {
            const nombre = d.producto_nombre || `Producto #${d.producto_id}`;
            return (
              <View
                key={d.detalle_id || index}
                style={[
                  styles.productItem,
                  index < pedido.detalles.length - 1 && styles.productItemBorder,
                ]}
              >
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>{d.cantidad}x</Text>
                </View>

                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{nombre}</Text>
                  <Text style={styles.productPrice}>
                    ${Number(d.precio_unit).toFixed(2)} c/u · Subtotal: ${Number(d.subtotal).toFixed(2)}
                  </Text>
                  {d.observaciones ? (
                    <View style={styles.obsContainer}>
                      <Ionicons name="chatbubble-outline" size={13} color={Colors.accent} />
                      <Text style={styles.obsText}>{d.observaciones}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Total Final */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
          <Text style={styles.totalAmount}>${Number(pedido.total).toFixed(2)} MXN</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'android' ? 32 : 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
    backgroundColor: Colors.background,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  content: { padding: 16, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '800', color: Colors.textLight, letterSpacing: 1, marginBottom: 2 },
  summaryValue: { fontSize: 18, fontWeight: '900', color: Colors.textPrimary },
  summarySub: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  estadoText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  btnEntregar: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnEntregarText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  productsList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productItem: { flexDirection: 'row', paddingVertical: 12 },
  productItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0ebe5' },
  qtyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  qtyText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  productDetails: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  productPrice: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  obsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  obsText: { fontSize: 12, color: Colors.accent, fontStyle: 'italic' },
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  totalAmount: { color: Colors.accent, fontSize: 22, fontWeight: '900' },
});
