import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiGetMesas } from '../../services/api';

type InicioStackParamList = {
  Mesas: undefined;
  Catalogo: { mesaId: number; mesaNumero: number; capacidad: number };
};

type MesasNavigationProp = NativeStackNavigationProp<InicioStackParamList, 'Mesas'>;

interface Mesa {
  mesa_id: number;
  numero: number;
  capacidad: number;
  estado: string; // 'LIBRE' | 'OCUPADA'
  disponible?: boolean;
}

// ─── Colores de estado ─────────────────────────────────────────
const MESA_LIBRE_BG = '#e8f5e9';
const MESA_LIBRE_BORDER = '#4CAF50';
const MESA_LIBRE_TEXT = '#2e7d32';
const MESA_OCUPADA_BG = '#ffebee';
const MESA_OCUPADA_BORDER = '#f44336';
const MESA_OCUPADA_TEXT = '#c62828';

export default function MesasScreen() {
  const navigation = useNavigation<MesasNavigationProp>();
  const { token, user, logout } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const loadMesas = useCallback(async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const data = await apiGetMesas(token);
      setMesas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', `No se pudieron cargar las mesas: ${err.message}`);
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  }, [token]);

  // Cargar al montar
  useEffect(() => { loadMesas(); }, [loadMesas]);

  // Recargar mesas cada vez que la pantalla recibe el foco (ej: al volver del catálogo)
  useFocusEffect(
    useCallback(() => {
      loadMesas(true);
    }, [loadMesas])
  );

  const isMesaLibre = (mesa: Mesa) => {
    if (typeof mesa.disponible === 'boolean') return mesa.disponible;
    return mesa.estado === 'LIBRE';
  };

  const handlePressMesa = (mesa: Mesa) => {
    const libre = isMesaLibre(mesa);
    if (!libre) {
      // Mesa ocupada: ofrecer agregar más productos
      Alert.alert(
        `Mesa ${mesa.numero} — Ocupada`,
        `Esta mesa ya tiene una orden activa.\n¿Deseas agregar más productos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Agregar productos',
            onPress: () =>
              navigation.navigate('Catalogo', {
                mesaId: mesa.mesa_id,
                mesaNumero: mesa.numero,
                capacidad: mesa.capacidad,
              }),
          },
        ]
      );
      return;
    }
    // Mesa libre: ir directo al catálogo
    navigation.navigate('Catalogo', {
      mesaId: mesa.mesa_id,
      mesaNumero: mesa.numero,
      capacidad: mesa.capacidad,
    });
  };

  const libres = mesas.filter(isMesaLibre).length;
  const ocupadas = mesas.length - libres;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando mesas…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Módulo Mesero</Text>
          <Text style={styles.headerTitle}>Mapa de Mesas</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.userName}>{user?.nombre?.split(' ')[0]}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Leyenda de estado */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MESA_LIBRE_BORDER }]} />
          <Text style={styles.legendText}>{libres} libres</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: MESA_OCUPADA_BORDER }]} />
          <Text style={styles.legendText}>{ocupadas} ocupadas</Text>
        </View>
        <Text style={styles.legendHint}>Toca una mesa para tomar una orden</Text>
      </View>

      {/* Grid de mesas */}
      <FlatList
        data={mesas}
        keyExtractor={(item) => String(item.mesa_id)}
        numColumns={3}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMesas(true)}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Sin mesas registradas</Text>
          </View>
        }
        renderItem={({ item }) => {
          const libre = isMesaLibre(item);
          return (
            <TouchableOpacity
              style={[
                styles.mesaCard,
                {
                  backgroundColor: libre ? MESA_LIBRE_BG : MESA_OCUPADA_BG,
                  borderColor: libre ? MESA_LIBRE_BORDER : MESA_OCUPADA_BORDER,
                },
              ]}
              onPress={() => handlePressMesa(item)}
              activeOpacity={0.75}
            >
              <Ionicons
                name="ellipse"
                size={12}
                color={libre ? MESA_LIBRE_BORDER : MESA_OCUPADA_BORDER}
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.mesaNumero,
                  { color: libre ? MESA_LIBRE_TEXT : MESA_OCUPADA_TEXT },
                ]}
              >
                Mesa {item.numero}
              </Text>
              <View style={styles.capacidadRow}>
                <Ionicons name="people-outline" size={12} color={Colors.textLight} />
                <Text style={styles.mesaCapacidad}>{item.capacidad}</Text>
              </View>
              <Text
                style={[
                  styles.mesaStatus,
                  { color: libre ? MESA_LIBRE_TEXT : MESA_OCUPADA_TEXT },
                ]}
              >
                {libre ? 'LIBRE' : 'OCUPADA'}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerSubtitle: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  logoutBtn: { padding: 4, marginLeft: 4 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  legendHint: {
    flex: 1,
    textAlign: 'right',
    color: Colors.textLight,
    fontSize: 11,
    fontStyle: 'italic',
  },
  grid: {
    padding: 12,
    paddingBottom: 100,
  },
  mesaCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  mesaNumero: { fontSize: 14, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  capacidadRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  mesaCapacidad: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
  mesaStatus: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Colors.textLight, fontSize: 16, fontWeight: '600', marginTop: 12 },
});
