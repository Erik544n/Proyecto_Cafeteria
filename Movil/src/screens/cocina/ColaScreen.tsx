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
import { PedidoCard } from '../../components/PedidoCard';
import { PEDIDOS_MOCK } from '../../data/mockData';

interface Props {
  navigation: any;
}

export default function ColaScreen({ navigation }: Props) {
  const urgentes = PEDIDOS_MOCK.filter(p => p.urgente || p.estado === 'URGENTE').length;
  const enEspera = PEDIDOS_MOCK.filter(p => p.estado === 'PENDIENTE').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>BrewMaster Ops</Text>
          <Text style={styles.rolBadge}>COCINA</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Panel de Cocina</Text>
          <Text style={styles.headerSub}>Gestión de pedidos en tiempo real</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notificaciones')}>
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifBadge}>
            <Text style={styles.notifCount}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Badges de estado */}
      <View style={styles.statusBar}>
        <View style={styles.badgeUrgente}>
          <Text style={styles.badgeDot}>●</Text>
          <Text style={styles.badgeTextUrgente}>{urgentes} URGENTES</Text>
        </View>
        <View style={styles.badgeEspera}>
          <Text style={styles.badgeDotWarning}>●</Text>
          <Text style={styles.badgeTextEspera}>{enEspera} EN ESPERA</Text>
        </View>
      </View>

      {/* Lista de pedidos */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PEDIDOS_MOCK.map(pedido => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            onPresionar={() => navigation.navigate('DetallePedido', { pedido })}
            onIniciar={() => {}}
            onListo={() => {}}
          />
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {PEDIDOS_MOCK.length} pedidos activos · actualizado ahora
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
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    color: Colors.accentLight,
    fontSize: 13,
    fontWeight: '700',
  },
  rolBadge: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  notifBtn: {
    position: 'relative',
    padding: 4,
  },
  notifIcon: {
    fontSize: 22,
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.urgente,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBar: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 10,
  },
  badgeUrgente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.urgenteLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
  },
  badgeDot: {
    color: Colors.urgente,
    fontSize: 8,
  },
  badgeTextUrgente: {
    color: Colors.urgente,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeEspera: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.pendienteLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
  },
  badgeDotWarning: {
    color: Colors.pendiente,
    fontSize: 8,
  },
  badgeTextEspera: {
    color: Colors.pendiente,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 12,
  },
});
