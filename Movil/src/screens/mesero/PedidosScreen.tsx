import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useMesero } from '../../context/MeseroContext';

interface Props {
  navigation: any;
}

const STATUS_STYLES = {
  PENDIENTE: {
    bg: Colors.pendienteLight,
    fg: Colors.warning,
    label: 'PENDIENTE',
  },
  EN_PREPARACION: {
    bg: Colors.preparandoLight,
    fg: Colors.preparando,
    label: 'EN_PREPARACION',
  },
  LISTO: {
    bg: Colors.listoLight,
    fg: Colors.success,
    label: 'LISTO',
  },
} as const;

export default function PedidosScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const { pedidos, entregarPedido } = useMesero();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={logout} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Salir</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Pedidos</Text>
          <Text style={styles.headerSubtitle}>Sigue el estado hasta que quede LISTO</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Notificaciones')} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Avisos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Pedidos activos</Text>
          <Text style={styles.summaryText}>{pedidos.length} pedidos en seguimiento</Text>
        </View>

        {pedidos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>Sin pedidos</Text>
            <Text style={styles.emptyTitle}>No hay pedidos activos</Text>
            <Text style={styles.emptyText}>Crea uno desde Mesas y Catalogo para comenzar.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Mesas')} activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>IR A MESAS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pedidos.map(pedido => {
            const status = STATUS_STYLES[pedido.estado];

            return (
              <View key={pedido.id} style={styles.pedidoCard}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.pedidoMesa}>{pedido.mesa}</Text>
                    <Text style={styles.pedidoTime}>{pedido.tiempo}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                  </View>
                </View>

                <View style={styles.itemsBlock}>
                  {pedido.items.map(item => (
                    <Text key={`${pedido.id}-${item.producto.id}`} style={styles.itemText}>
                      {item.cantidad}x {item.producto.nombre}
                    </Text>
                  ))}
                </View>

                <View style={styles.cardBottomRow}>
                  <Text style={styles.totalText}>Total: ${pedido.total.toFixed(0)} MXN</Text>

                  {pedido.estado === 'LISTO' ? (
                    <TouchableOpacity
                      style={styles.deliverButton}
                      onPress={() => {
                        entregarPedido(pedido.id);
                        Alert.alert('Entregado', `${pedido.mesa} fue enviado a entrega.`);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.deliverButtonText}>ENTREGAR</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.waitButton}
                      onPress={() => Alert.alert('Seguimiento', 'El pedido sigue en proceso.')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.waitButtonText}>EN ESPERA</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerButton: {
    backgroundColor: '#F5ECE1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  headerButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 16,
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  summaryText: {
    color: Colors.accentLight,
    marginTop: 4,
    fontSize: 12,
  },
  pedidoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pedidoMesa: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pedidoTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemsBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 6,
  },
  itemText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  cardBottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  deliverButton: {
    backgroundColor: Colors.listo,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  deliverButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  waitButton: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  waitButtonText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 14,
    marginBottom: 10,
    color: Colors.textLight,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 240,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});