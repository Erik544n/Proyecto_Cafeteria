import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Pedido, EstadoPedido } from '../data/mockData';

interface PedidoCardProps {
  pedido: Pedido;
  onIniciar?: () => void;
  onListo?: () => void;
  onPresionar?: () => void;
}

const etiquetaEstado: Record<EstadoPedido, string> = {
  PENDIENTE: 'EN PREPARACIÓN',
  EN_PREPARACION: 'EN PREPARACIÓN',
  LISTO: 'MARCAR COMO LISTO',
  URGENTE: 'EN PREPARACIÓN',
};

const colorBoton: Record<EstadoPedido, string> = {
  PENDIENTE: Colors.primary,
  EN_PREPARACION: Colors.primary,
  LISTO: Colors.listo,
  URGENTE: Colors.primary,
};

export const PedidoCard: React.FC<PedidoCardProps> = ({
  pedido,
  onIniciar,
  onListo,
  onPresionar,
}) => {
  const esUrgente = pedido.urgente || pedido.estado === 'URGENTE';
  const borderColor = esUrgente ? Colors.urgenteBorder : Colors.border;
  const headerBg = esUrgente ? Colors.urgente : Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor }]}
      onPress={onPresionar}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          {esUrgente && (
            <View style={styles.urgenteBadge}>
              <Text style={styles.urgenteText}>URGENTE</Text>
            </View>
          )}
          {pedido.barra && (
            <View style={styles.barraBadge}>
              <Text style={styles.barraText}>PREPARANDO • BARRA</Text>
            </View>
          )}
          {!esUrgente && !pedido.barra && (
            <Text style={styles.estadoHeader}>
              {pedido.estado === 'PENDIENTE' ? 'PEDIDO' : 'PEDIDO'}
            </Text>
          )}
          <Text style={styles.mesaHeader}>
            {pedido.mesa ? `• ${pedido.mesa.toUpperCase()}` : '• LLEVAR YA'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {pedido.barra && pedido.tiempoInicio ? (
            <Text style={styles.tiempoHeader}>{pedido.tiempoInicio}</Text>
          ) : (
            <Text style={styles.tiempoHeader}>{pedido.tiempoEspera}</Text>
          )}
          {esUrgente && (
            <Text style={styles.urgenteIcon}>⚠</Text>
          )}
          {pedido.barra && (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </View>
      </View>

      {/* Ticket */}
      <View style={styles.body}>
        <Text style={styles.ticketNum}>Ticket #{pedido.ticket}</Text>

        {/* Productos */}
        {pedido.productos.map((prod, idx) => (
          <View key={idx} style={styles.productoRow}>
            <Text style={styles.cantidad}>{prod.cantidad}x</Text>
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre}>{prod.nombre}</Text>
              {prod.observaciones && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="chatbubble-outline" size={12} color={Colors.accent} />
                  <Text style={styles.observaciones}>{prod.observaciones}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Botón de acción */}
      <TouchableOpacity
        style={[styles.botonAccion, { backgroundColor: colorBoton[pedido.estado] }]}
        onPress={pedido.estado === 'LISTO' ? onListo : onIniciar}
        activeOpacity={0.8}
      >
        <Text style={styles.botonTexto}>
          {pedido.estado === 'LISTO' ? 'MARCAR COMO LISTO ✓' : 'EN PREPARACIÓN'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgenteBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgenteText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  barraBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  barraText: {
    color: Colors.accentLight,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  estadoHeader: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mesaHeader: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tiempoHeader: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  urgenteIcon: {
    color: '#ffffff',
    fontSize: 14,
  },
  refreshIcon: {
    color: Colors.accentLight,
    fontSize: 16,
  },
  body: {
    padding: 14,
  },
  ticketNum: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  productoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
  },
  cantidad: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    minWidth: 28,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '400',
  },
  observaciones: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
    backgroundColor: Colors.accentLight + '40',
    padding: 6,
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  botonAccion: {
    marginHorizontal: 14,
    marginBottom: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
