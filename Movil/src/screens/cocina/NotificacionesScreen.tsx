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

interface Props {
  navigation: any;
}

export default function NotificacionesScreen({ navigation }: Props) {
  const notificaciones = [
    {
      id: 1,
      tipo: 'alerta',
      titulo: 'Stock crítico: Champiñones frescos',
      descripcion: 'El stock llegó a 0. Se necesita reabastecimiento urgente.',
      tiempo: 'Hace 3 min',
      leida: false,
    },
    {
      id: 2,
      tipo: 'warning',
      titulo: 'Stock bajo: Queso Manchego',
      descripcion: 'Solo quedan 20g disponibles. Mínimo: 100g.',
      tiempo: 'Hace 8 min',
      leida: false,
    },
    {
      id: 3,
      tipo: 'info',
      titulo: 'Pedido #395 lleva 25 min esperando',
      descripcion: 'Mesa "Para llevar" — 4x Tostadas Francesas.',
      tiempo: 'Hace 25 min',
      leida: true,
    },
    {
      id: 4,
      tipo: 'success',
      titulo: 'Pedido #400 marcado como listo',
      descripcion: 'El mesero fue notificado para recoger.',
      tiempo: 'Hace 30 min',
      leida: true,
    },
  ];

  const iconos = {
    alerta: '⛔',
    warning: '⚠️',
    info: '⏰',
    success: '✅',
  };

  const colores: Record<string, string> = {
    alerta: Colors.urgenteLight,
    warning: Colors.pendienteLight,
    info: '#f0f4ff',
    success: Colors.listoLight,
  };

  const coloresBorde: Record<string, string> = {
    alerta: Colors.urgenteBorder,
    warning: Colors.pendienteBorder,
    info: '#c3d0f0',
    success: Colors.listoBorder,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSub}>Cocina</Text>
        </View>
        <TouchableOpacity style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Marcar todas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notificaciones.map(notif => (
          <TouchableOpacity
            key={notif.id}
            style={[
              styles.notifCard,
              { backgroundColor: colores[notif.tipo], borderColor: coloresBorde[notif.tipo] },
              notif.leida && styles.notifLeida,
            ]}
            activeOpacity={0.85}
          >
            {!notif.leida && <View style={styles.puntoPuntoNo} />}
            <Text style={styles.notifIcono}>{iconos[notif.tipo as keyof typeof iconos]}</Text>
            <View style={styles.notifTextos}>
              <Text style={[styles.notifTitulo, notif.leida && styles.notifTituloLeida]}>
                {notif.titulo}
              </Text>
              <Text style={styles.notifDesc}>{notif.descripcion}</Text>
              <Text style={styles.notifTiempo}>{notif.tiempo}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 80 }} />
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
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllText: {
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    gap: 10,
  },
  notifCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
  },
  notifLeida: {
    opacity: 0.6,
  },
  puntoPuntoNo: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.urgente,
  },
  notifIcono: {
    fontSize: 22,
    marginTop: 1,
  },
  notifTextos: {
    flex: 1,
  },
  notifTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  notifTituloLeida: {
    fontWeight: '500',
  },
  notifDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 5,
  },
  notifTiempo: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});
