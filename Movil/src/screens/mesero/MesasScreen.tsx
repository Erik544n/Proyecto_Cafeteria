import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { MESAS_MOCK, MesaDetalle } from '../../data/mockData';

interface Props {
  navigation: any;
}

const AREAS = ['PLANTA_BAJA', 'TERRAZA'] as const;
const AREA_NAMES = {
  PLANTA_BAJA: 'Planta Baja',
  TERRAZA: 'Terraza exterior',
};

export default function MesasScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [activeArea, setActiveArea] = useState<'PLANTA_BAJA' | 'TERRAZA'>('PLANTA_BAJA');
  const [selectedMesa, setSelectedMesa] = useState<MesaDetalle | null>(null);

  const activeMesas = MESAS_MOCK.filter(m => m.area === activeArea);

  const getStatusColor = (estado: MesaDetalle['estado']) => {
    if (estado === 'OCUPADA') return Colors.urgente;
    if (estado === 'RESERVADA') return Colors.pendiente;
    return Colors.listo;
  };

  const getStatusBgColor = (estado: MesaDetalle['estado']) => {
    if (estado === 'OCUPADA') return Colors.urgenteLight;
    if (estado === 'RESERVADA') return Colors.pendienteLight;
    return Colors.listoLight;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={logout} activeOpacity={0.8} style={styles.logoutBtn}>
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mapa de Mesas</Text>
        
        <View style={{ width: 68 }} />
      </View>

      {/* Áreas selector */}
      <View style={styles.areasRow}>
        {AREAS.map(area => (
          <TouchableOpacity
            key={area}
            style={[styles.areaTab, activeArea === area && styles.areaTabActive]}
            onPress={() => {
              setActiveArea(area);
              setSelectedMesa(null);
            }}
          >
            <Text style={[styles.areaTabText, activeArea === area && styles.areaTabTextActive]}>
              {AREA_NAMES[area]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mapa contenedor */}
      <View style={styles.mapContainer}>
        <View style={styles.mapGrid}>
          {/* Fondo cuadriculado decorativo */}
          <View style={styles.gridOverlay} />
          
          {activeMesas.map(mesa => {
            const isSelected = selectedMesa?.id === mesa.id;
            const statusColor = getStatusColor(mesa.estado);
            const statusBg = getStatusBgColor(mesa.estado);

            return (
              <TouchableOpacity
                key={mesa.id}
                style={[
                  styles.mesaNode,
                  {
                    left: `${mesa.x}%`,
                    top: `${mesa.y}%`,
                    borderColor: isSelected ? Colors.primary : statusColor,
                    backgroundColor: statusBg,
                    borderWidth: isSelected ? 3 : 1.5,
                  },
                ]}
                onPress={() => setSelectedMesa(mesa)}
                activeOpacity={0.85}
              >
                <Text style={styles.mesaNodeNum}>{mesa.numero}</Text>
                <Text style={styles.mesaNodeCap}>{mesa.capacidad}p</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Leyenda */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.listo }]} />
            <Text style={styles.legendText}>Libre</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.urgente }]} />
            <Text style={styles.legendText}>Ocupada</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.pendiente }]} />
            <Text style={styles.legendText}>Reservada</Text>
          </View>
        </View>
      </View>

      {/* Detalle de Mesa Seleccionada */}
      {selectedMesa && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View>
              <Text style={styles.detailTitle}>Mesa {selectedMesa.numero}</Text>
              <Text style={styles.detailSubtitle}>Capacidad: {selectedMesa.capacidad} personas</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusBgColor(selectedMesa.estado) }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(selectedMesa.estado) }
              ]}>
                {selectedMesa.estado}
              </Text>
            </View>
          </View>

          {/* Acciones para la mesa */}
          <View style={styles.detailActions}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => {
                navigation.navigate('Pedidos');
              }}
            >
              <Text style={styles.actionBtnPrimaryText}>
                {selectedMesa.estado === 'OCUPADA' ? 'Ver / Editar Pedido' : 'Abrir Nuevo Pedido'}
              </Text>
            </TouchableOpacity>

            {selectedMesa.estado === 'OCUPADA' && (
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => Alert.alert('Caja', 'Generando pre-cuenta de la mesa...')}
              >
                <Text style={styles.actionBtnSecondaryText}>Pedir Cuenta</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF6F0',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8e0',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5ECE1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  logoutEmoji: {
    fontSize: 14,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  areasRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8e0',
  },
  areaTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  areaTabActive: {
    borderBottomColor: Colors.primary,
  },
  areaTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
  },
  areaTabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  mapContainer: {
    flex: 1,
    padding: 16,
  },
  mapGrid: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 4,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    borderWidth: 0.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  mesaNode: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // Centrar respecto a x, y de posicionamiento
    transform: [{ translateX: -30 }, { translateY: -30 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  mesaNodeNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mesaNodeCap: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 14,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  detailCard: {
    position: 'absolute',
    bottom: 84, // arriba de las tabs
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  detailSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnSecondary: {
    backgroundColor: '#F5ECE1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
