import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiMeseroGetNotificaciones } from '../../services/api';

interface Notificacion {
  notificacion_id: number;
  pedido_id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  creado_en: string;
}

export default function NotificacionesMeseroScreen() {
  const { token } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarNotificaciones = async () => {
    if (!token) return;
    try {
      const data = await apiMeseroGetNotificaciones(token);
      setNotificaciones(data);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarNotificaciones();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarNotificaciones();
  };

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'PEDIDO_LISTO':
        return { name: 'checkmark-circle' as const, color: Colors.listo, bg: Colors.listoLight, border: Colors.listoBorder };
      case 'PEDIDO_CANCELADO':
        return { name: 'close-circle' as const, color: Colors.urgente, bg: Colors.urgenteLight, border: Colors.urgenteBorder };
      default:
        return { name: 'notifications' as const, color: Colors.pendiente, bg: Colors.pendienteLight, border: Colors.pendienteBorder };
    }
  };

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date();
    const notifDate = new Date(fecha);
    const diffMs = ahora.getTime() - notifDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Justo ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    return `Hace ${Math.floor(diffHrs / 24)}d`;
  };

  const renderNotificacion = ({ item }: { item: Notificacion }) => {
    const icono = getIcono(item.tipo);
    return (
      <View
        style={[
          styles.notifCard,
          { backgroundColor: icono.bg, borderColor: icono.border },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: icono.color + '20' }]}>
          <Ionicons name={icono.name} size={26} color={icono.color} />
        </View>
        <View style={styles.notifTextos}>
          <Text style={styles.notifTipo}>
            {item.tipo === 'PEDIDO_LISTO' ? '✅ Pedido Listo' : item.tipo === 'PEDIDO_CANCELADO' ? '❌ Pedido Cancelado' : '🔔 Notificación'}
          </Text>
          <Text style={styles.notifMensaje}>{item.mensaje}</Text>
          <View style={styles.notifMeta}>
            <Ionicons name="time-outline" size={12} color={Colors.textLight} />
            <Text style={styles.notifTiempo}>{formatearTiempo(item.creado_en)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="notifications" size={24} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSub}>
            {notificaciones.length === 0
              ? 'Sin notificaciones nuevas'
              : `${notificaciones.length} notificación${notificaciones.length !== 1 ? 'es' : ''}`}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {notificaciones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptyDesc}>
              Cuando la cocina tenga un pedido listo,{'\n'}te aparecerá aquí.
            </Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.refreshBtnText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={notificaciones}
            keyExtractor={(item) => item.notificacion_id.toString()}
            renderItem={renderNotificacion}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListFooterComponent={<View style={{ height: 90 }} />}
          />
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 16,
    gap: 14,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTextos: {
    flex: 1,
  },
  notifTipo: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notifMensaje: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 8,
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifTiempo: {
    fontSize: 11,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
