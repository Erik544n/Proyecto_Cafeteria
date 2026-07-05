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
import { PEDIDO_BLOQUEADO_MOCK } from '../../data/mockData';

interface Props {
  navigation: any;
  route: any;
}

export default function IngredientesInsuficientesScreen({ navigation }: Props) {
  const pedido = PEDIDO_BLOQUEADO_MOCK;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Detalle de Pedido</Text>
          <Text style={styles.headerSub}>Ingredientes Insuficientes</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alerta principal */}
        <View style={styles.alertaBanner}>
          <View style={styles.alertaIconWrap}>
            <Text style={styles.alertaIcon}>⚠</Text>
          </View>
          <View style={styles.alertaTexts}>
            <Text style={styles.alertaTitulo}>Ingredientes Insuficientes</Text>
            <Text style={styles.alertaDescripcion}>
              Ticket #{pedido.ticket} · {pedido.mesa} no puede prepararse{' '}
              <Text style={styles.ahoraLink}>AHORA</Text>
            </Text>
          </View>
        </View>

        {/* Pedido afectado */}
        <Text style={styles.seccionLabel}>PEDIDO AFECTADO</Text>
        <View style={styles.pedidoAfectado}>
          <View style={styles.pedidoAfectadoHeader}>
            <View style={styles.bloqueadoBadge}>
              <Text style={styles.bloqueadoTexto}>⛔ BLOQUEADO · {pedido.mesa.toUpperCase()}</Text>
            </View>
            <Text style={styles.tiempoPedido}>{pedido.tiempo}</Text>
          </View>
          <Text style={styles.ticketTitle}>Ticket #{pedido.ticket}</Text>
          {pedido.productos.map((prod, idx) => (
            <View key={idx}>
              <Text style={styles.productoPedido}>
                {prod.cantidad}x {prod.nombre}
              </Text>
              {prod.observaciones && (
                <Text style={styles.notaPedido}>{prod.observaciones}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Ingredientes faltantes */}
        <Text style={styles.seccionLabel}>INGREDIENTES FALTANTES</Text>
        <View style={styles.insumosList}>
          {pedido.insumosFaltantes.map((ins, idx) => (
            <View key={idx} style={styles.insumoRow}>
              <View style={[
                styles.insumoDot,
                { backgroundColor: ins.estado === 'sin_stock' ? Colors.urgente : Colors.pendiente }
              ]} />
              <View style={styles.insumoInfo}>
                <Text style={styles.insumoNombre}>{ins.nombre}</Text>
                <Text style={styles.insumoStock}>
                  Disponible: {ins.disponible} · Necesario: {ins.necesario}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Leyenda */}
        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: Colors.urgente }]} />
            <Text style={styles.leyendaTexto}>Sin stock</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: Colors.pendiente }]} />
            <Text style={styles.leyendaTexto}>Stock bajo</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sección ACCIONES */}
        <Text style={styles.seccionLabel}>ACCIONES</Text>

        <TouchableOpacity style={styles.botonNotificar} activeOpacity={0.85}>
          <Text style={styles.botonNotificarTexto}>🔔  Notificar a Caja</Text>
        </TouchableOpacity>

        <View style={styles.accionesSecundarias}>
          <TouchableOpacity style={styles.botonCancelar} activeOpacity={0.85}>
            <Text style={styles.botonCancelarTexto}>Cancelar Pedido</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonParcial} activeOpacity={0.85}>
            <Text style={styles.botonParcialTexto}>Pedido Parcial</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerInfoTexto}>
            4 pedidos más en espera ·{' '}
            <Text
              style={styles.verTodosLink}
              onPress={() => navigation.goBack()}
            >
              Ver todos
            </Text>
          </Text>
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
    fontWeight: '300',
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
  alertaBanner: {
    backgroundColor: Colors.urgenteLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.urgenteBorder,
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  alertaIconWrap: {
    width: 36,
    height: 36,
    backgroundColor: Colors.urgente + '20',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertaIcon: {
    fontSize: 18,
    color: Colors.urgente,
  },
  alertaTexts: {
    flex: 1,
  },
  alertaTitulo: {
    color: Colors.urgente,
    fontWeight: '700',
    fontSize: 14,
  },
  alertaDescripcion: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  ahoraLink: {
    color: Colors.urgente,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  seccionLabel: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  pedidoAfectado: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.urgenteBorder,
    padding: 14,
    marginBottom: 20,
  },
  pedidoAfectadoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bloqueadoBadge: {
    backgroundColor: Colors.urgenteLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bloqueadoTexto: {
    color: Colors.urgente,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tiempoPedido: {
    color: Colors.textLight,
    fontSize: 12,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  productoPedido: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  notaPedido: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 4,
  },
  insumosList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  insumoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insumoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  insumoInfo: {
    flex: 1,
  },
  insumoNombre: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  insumoStock: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leyenda: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  botonNotificar: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  botonNotificarTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  accionesSecundarias: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  botonCancelarTexto: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  botonParcial: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.accentLight + '30',
  },
  botonParcialTexto: {
    color: Colors.primaryLight,
    fontWeight: '600',
    fontSize: 14,
  },
  footerInfo: {
    alignItems: 'center',
    paddingTop: 4,
  },
  footerInfoTexto: {
    color: Colors.textLight,
    fontSize: 12,
  },
  verTodosLink: {
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
