import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { PEDIDOS_MOCK } from '../../data/mockData';

interface Props {
  navigation: any;
  route: any;
}

export default function DetallePedidoScreen({ navigation, route }: Props) {
  const pedido = route?.params?.pedido ?? PEDIDOS_MOCK[0];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Ticket #{pedido.ticket}</Text>
          <Text style={styles.headerSub}>{pedido.mesa ?? 'Para llevar'}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Estado badge */}
        <View style={styles.estadoWrap}>
          <View style={[
            styles.estadoBadge,
            pedido.urgente && styles.estadoBadgeUrgente,
            pedido.estado === 'EN_PREPARACION' && styles.estadoBadgePreparando,
          ]}>
            <Text style={styles.estadoTexto}>
              {pedido.urgente ? '⚡ URGENTE' : pedido.estado === 'EN_PREPARACION' ? '👨‍🍳 EN PREPARACIÓN' : '⏳ PENDIENTE'}
            </Text>
          </View>
          <Text style={styles.tiempoTexto}>{pedido.tiempoEspera}</Text>
        </View>

        {/* Productos */}
        <Text style={styles.seccionLabel}>PRODUCTOS A PREPARAR</Text>
        <View style={styles.productosCard}>
          {pedido.productos.map((prod: any, idx: number) => (
            <View key={idx} style={[styles.productoItem, idx < pedido.productos.length - 1 && styles.productoItemBorder]}>
              <View style={styles.cantidadCircle}>
                <Text style={styles.cantidadTexto}>{prod.cantidad}</Text>
              </View>
              <View style={styles.productoDetalles}>
                <Text style={styles.productoNombre}>{prod.nombre}</Text>
                {prod.observaciones && (
                  <View style={styles.obsWrap}>
                    <Text style={styles.obsTexto}>💬 {prod.observaciones}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Info de mesa */}
        <Text style={styles.seccionLabel}>INFORMACIÓN</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mesa / Destino</Text>
            <Text style={styles.infoValor}>{pedido.mesa ?? 'Para llevar'}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiempo en espera</Text>
            <Text style={styles.infoValor}>{pedido.tiempoEspera}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Productos</Text>
            <Text style={styles.infoValor}>{pedido.productos.length} ítem(s)</Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.acciones}>
          <TouchableOpacity
            style={styles.botonListo}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.botonListoTexto}>✓  Marcar como LISTO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonIngredientes}
            onPress={() => navigation.navigate('IngredientesInsuficientes')}
          >
            <Text style={styles.botonIngredientesTexto}>⚠  Ingredientes Insuficientes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonCancelar}>
            <Text style={styles.botonCancelarTexto}>Cancelar Pedido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 22,
  },
  headerTexts: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  estadoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  estadoBadge: {
    backgroundColor: Colors.pendienteLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.pendienteBorder,
  },
  estadoBadgeUrgente: {
    backgroundColor: Colors.urgenteLight,
    borderColor: Colors.urgenteBorder,
  },
  estadoBadgePreparando: {
    backgroundColor: Colors.preparandoLight,
    borderColor: Colors.preparandoBorder,
  },
  estadoTexto: {
    fontWeight: '700',
    fontSize: 12,
    color: Colors.textPrimary,
  },
  tiempoTexto: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  seccionLabel: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  productosCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  productoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  productoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cantidadCircle: {
    width: 32,
    height: 32,
    backgroundColor: Colors.accent + '30',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cantidadTexto: {
    fontWeight: '700',
    color: Colors.primary,
    fontSize: 14,
  },
  productoDetalles: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  obsWrap: {
    backgroundColor: Colors.accentLight + '40',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  obsTexto: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoSep: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValor: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  acciones: {
    gap: 10,
  },
  botonListo: {
    backgroundColor: Colors.listo,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  botonListoTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  botonIngredientes: {
    backgroundColor: Colors.urgenteLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.urgenteBorder,
  },
  botonIngredientesTexto: {
    color: Colors.urgente,
    fontWeight: '600',
    fontSize: 14,
  },
  botonCancelar: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  botonCancelarTexto: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});
