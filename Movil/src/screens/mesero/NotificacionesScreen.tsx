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
import { useMesero } from '../../context/MeseroContext';

interface Props {
  navigation: any;
}

export default function NotificacionesScreen({ navigation }: Props) {
  const { notificaciones, marcarNotificacionLeida } = useMesero();

  const noLeidas = notificaciones.filter(notificacion => !notificacion.leida);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Mesas')} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Mesas</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>Avisos de pedidos listos para entregar</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Pedidos')} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Pedidos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{noLeidas.length} sin leer</Text>
          <Text style={styles.summaryText}>Cuando un pedido quede LISTO, aparecera aqui.</Text>
        </View>

        {noLeidas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>Silencio</Text>
            <Text style={styles.emptyTitle}>No hay notificaciones nuevas</Text>
            <Text style={styles.emptyText}>Vuelve mas tarde para ver pedidos listos para entregar.</Text>
          </View>
        ) : (
          noLeidas.map(notificacion => (
            <TouchableOpacity
              key={notificacion.id}
              style={styles.notificationCard}
              activeOpacity={0.85}
              onPress={() => marcarNotificacionLeida(notificacion.id)}
            >
              <View style={styles.notificationTopRow}>
                <Text style={styles.notificationTitle}>{notificacion.titulo}</Text>
                <View style={[styles.badge, notificacion.tipo === 'LISTO' ? styles.badgeReady : styles.badgeInfo]}>
                  <Text style={styles.badgeText}>{notificacion.tipo}</Text>
                </View>
              </View>
              <Text style={styles.notificationText}>{notificacion.detalle}</Text>
              <Text style={styles.notificationHint}>Toca para marcar como leida</Text>
            </TouchableOpacity>
          ))
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
    fontSize: 18,
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
    paddingBottom: 60,
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
  notificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  notificationTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeReady: {
    backgroundColor: Colors.listoLight,
  },
  badgeInfo: {
    backgroundColor: Colors.accentLight,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  notificationText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  notificationHint: {
    marginTop: 10,
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: '600',
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
});