import React, { useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { MesaDetalle } from '../../data/mockData';
import { useMesero } from '../../context/MeseroContext';

interface Props {
  navigation: any;
}

const AREAS = ['PLANTA_BAJA', 'TERRAZA', 'SEGUNDO_PISO'] as const;

const AREA_NAMES: Record<(typeof AREAS)[number], string> = {
  PLANTA_BAJA: 'Planta baja',
  TERRAZA: 'Terraza',
  SEGUNDO_PISO: 'Segundo piso',
};

export default function MesasScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const { mesas, mesaActiva, seleccionarMesa } = useMesero();
  const [activeArea, setActiveArea] = useState<(typeof AREAS)[number]>('PLANTA_BAJA');

  const mesasFiltradas = useMemo(
    () => mesas.filter(mesa => mesa.area === activeArea),
    [activeArea, mesas],
  );

  const getMesaColor = (estado: MesaDetalle['estado']) => {
    if (estado === 'OCUPADA') return Colors.urgente;
    if (estado === 'RESERVADA') return Colors.pendiente;
    return Colors.listo;
  };

  const getMesaBgColor = (estado: MesaDetalle['estado']) => {
    if (estado === 'OCUPADA') return Colors.urgenteLight;
    if (estado === 'RESERVADA') return Colors.pendienteLight;
    return Colors.listoLight;
  };

  const handleMesaPress = (mesa: MesaDetalle) => {
    seleccionarMesa(mesa);
    navigation.navigate(mesa.estado === 'LIBRE' ? 'Catalogo' : 'Pedidos');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={logout} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Salir</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Mesas</Text>
          <Text style={styles.headerSubtitle}>Selecciona una mesa libre para iniciar el pedido</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notificaciones')}
          style={styles.headerButton}
          activeOpacity={0.8}
        >
          <Text style={styles.headerButtonText}>Avisos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.areasRow}>
        {AREAS.map(area => (
          <TouchableOpacity
            key={area}
            style={[styles.areaChip, activeArea === area && styles.areaChipActive]}
            onPress={() => setActiveArea(area)}
            activeOpacity={0.85}
          >
            <Text style={[styles.areaChipText, activeArea === area && styles.areaChipTextActive]}>
              {AREA_NAMES[area]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Mapa de mesas</Text>
        <Text style={styles.sectionSubtitle}>Verde = libre, rojo = ocupada</Text>

        <View style={styles.gridContainer}>
          {mesasFiltradas.map(mesa => {
            const selected = mesaActiva?.id === mesa.id;
            const borderColor = getMesaColor(mesa.estado);
            const backgroundColor = getMesaBgColor(mesa.estado);

            return (
              <TouchableOpacity
                key={mesa.id}
                style={[
                  styles.mesaCard,
                  {
                    left: `${mesa.x}%`,
                    top: `${mesa.y}%`,
                    borderColor: selected ? Colors.primary : borderColor,
                    backgroundColor,
                    borderWidth: selected ? 3 : 1.5,
                  },
                ]}
                activeOpacity={0.9}
                onPress={() => handleMesaPress(mesa)}
              >
                <Text style={styles.mesaNumero}>{mesa.numero}</Text>
                <Text style={styles.mesaCapacidad}>{mesa.capacidad} pax</Text>
                <Text style={[styles.mesaEstado, { color: borderColor }]}>{mesa.estado}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {mesaActiva ? (
          <View style={styles.detailCard}>
            <View style={styles.detailTopRow}>
              <View>
                <Text style={styles.detailTitle}>Mesa {mesaActiva.numero}</Text>
                <Text style={styles.detailText}>Ubicacion: {AREA_NAMES[mesaActiva.area]}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getMesaBgColor(mesaActiva.estado) }]}>
                <Text style={[styles.statusBadgeText, { color: getMesaColor(mesaActiva.estado) }]}>
                  {mesaActiva.estado}
                </Text>
              </View>
            </View>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate(mesaActiva.estado === 'LIBRE' ? 'Catalogo' : 'Pedidos')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {mesaActiva.estado === 'LIBRE' ? 'Ir al catalogo' : 'Ver pedidos'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Notificaciones')}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>Notificaciones</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
  areasRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  areaChip: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#F5ECE1',
    paddingVertical: 10,
    alignItems: 'center',
  },
  areaChipActive: {
    backgroundColor: Colors.primary,
  },
  areaChipText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  areaChipTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'serif',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 14,
  },
  gridContainer: {
    minHeight: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    position: 'relative',
    overflow: 'hidden',
    padding: 12,
  },
  mesaCard: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -34 }, { translateY: -34 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  mesaNumero: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mesaCapacidad: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  mesaEstado: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  detailCard: {
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontWeight: '800',
    fontSize: 11,
  },
  detailActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});