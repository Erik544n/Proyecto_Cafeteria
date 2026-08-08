import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiGetPedidos } from '../../services/api';

type EstadoFiltro = 'TODOS' | 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

const FILTROS: { key: EstadoFiltro; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'TODOS', label: 'Todos', icon: 'list-outline' },
  { key: 'PENDIENTE', label: 'Pendiente', icon: 'time-outline' },
  { key: 'EN_PREPARACION', label: 'En Prep.', icon: 'flame-outline' },
  { key: 'LISTO', label: 'Listo', icon: 'checkmark-circle-outline' },
  { key: 'ENTREGADO', label: 'Entregado', icon: 'checkmark-done-outline' },
  { key: 'CANCELADO', label: 'Cancelado', icon: 'close-circle-outline' },
];

const ESTADO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDIENTE:       { bg: '#fff8e1', text: '#e65100', border: '#ffb300' },
  EN_PREPARACION:  { bg: '#fff3e0', text: '#bf360c', border: '#ff6f00' },
  LISTO:           { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' },
  ENTREGADO:       { bg: '#e3f2fd', text: '#0d47a1', border: '#1976d2' },
  CANCELADO:       { bg: '#fce4ec', text: '#b71c1c', border: '#e53935' },
};

interface Detalle {
  detalle_id: number;
  producto_id: number;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
  observaciones?: string;
  producto_nombre?: string;
}

interface Pedido {
  pedido_id: number;
  mesa_id?: number;
  usuario_id: number;
  estado: string;
  observaciones?: string;
  total: number;
  creado_en: string;
  detalles: Detalle[];
}

function formatHora(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function formatFecha(isoString: string) {
  try {
    const d = new Date(isoString);
    const hoy = new Date();
    if (
      d.getDate() === hoy.getDate() &&
      d.getMonth() === hoy.getMonth() &&
      d.getFullYear() === hoy.getFullYear()
    ) {
      return `Hoy ${formatHora(isoString)}`;
    }
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) + ' ' + formatHora(isoString);
  } catch {
    return isoString;
  }
}

export default function PedidosScreen() {
  const navigation = useNavigation<any>();
  const { token, logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<EstadoFiltro>('TODOS');

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const loadPedidos = useCallback(async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const data = await apiGetPedidos(token);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', `No se pudieron cargar los pedidos: ${err.message}`);
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadPedidos(); }, [loadPedidos]);

  // Auto-reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPedidos(true);
    }, [loadPedidos])
  );

  const pedidosFiltrados = filtro === 'TODOS'
    ? pedidos
    : pedidos.filter((p) => p.estado === filtro);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando pedidos…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header Fijo */}
      <View style={styles.topFixedContainer}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mis Pedidos</Text>
            <Text style={styles.headerSub}>{pedidos.length} pedidos · Desliza para actualizar</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="#e53935" />
          </TouchableOpacity>
        </View>

        {/* Filtros Horizontales Fijos */}
        <View style={styles.filtrosWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtrosList}
          >
            {FILTROS.map((f) => {
              const isActive = filtro === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filtroBtn, isActive && styles.filtroBtnActive]}
                  onPress={() => setFiltro(f.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={f.icon}
                    size={15}
                    color={isActive ? '#fff' : Colors.textSecondary}
                  />
                  <Text style={[styles.filtroText, isActive && styles.filtroTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Lista de pedidos compacta */}
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => String(item.pedido_id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPedidos(true)}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Sin pedidos</Text>
            <Text style={styles.emptyText}>
              {filtro === 'TODOS'
                ? 'No tienes pedidos registrados. Ve a Mesas para tomar uno.'
                : `No hay pedidos en estado "${filtro}".`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const estado = ESTADO_COLORS[item.estado] ?? { bg: '#f5f5f5', text: '#666', border: '#ccc' };
          const totalItems = item.detalles.reduce((acc, d) => acc + d.cantidad, 0);

          return (
            <TouchableOpacity
              style={[styles.pedidoCard, { borderLeftColor: estado.border }]}
              onPress={() => navigation.navigate('DetallePedidoMesero', { pedido: item })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.pedidoIdRow}>
                  <Text style={styles.pedidoId}>Pedido #{item.pedido_id}</Text>
                  {item.mesa_id && (
                    <View style={styles.mesaBadge}>
                      <Text style={styles.mesaBadgeText}>Mesa {item.mesa_id}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </View>

              <Text style={styles.pedidoFecha}>{formatFecha(item.creado_en)}</Text>

              <View style={styles.cardMiddleRow}>
                <View style={[styles.estadoBadge, { backgroundColor: estado.bg, borderColor: estado.border }]}>
                  <Text style={[styles.estadoText, { color: estado.text }]}>
                    {item.estado.replace('_', ' ')}
                  </Text>
                </View>

                <View style={styles.itemsCountBadge}>
                  <Ionicons name="cube-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.itemsCountText}>{totalItems} producto(s)</Text>
                </View>
              </View>

              <View style={styles.cardFooterRow}>
                <Text style={styles.verDetalleHint}>Ver productos y detalles</Text>
                <Text style={styles.pedidoTotal}>${Number(item.total).toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'android' ? 32 : 0 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  topFixedContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
    zIndex: 10,
    elevation: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: 6, marginLeft: 8 },
  filtrosWrapper: {
    height: 52,
    justifyContent: 'center',
  },
  filtrosList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  filtroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: '#e0d5cc',
    height: 36,
  },
  filtroBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtroText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  filtroTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginTop: 12, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  pedidoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pedidoIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pedidoId: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  mesaBadge: { backgroundColor: Colors.accent + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mesaBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  pedidoFecha: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, marginBottom: 10 },
  cardMiddleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  estadoText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  itemsCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f0eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  itemsCountText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0ebe5', paddingTop: 10 },
  verDetalleHint: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  pedidoTotal: { fontSize: 18, fontWeight: '900', color: Colors.primary },
});
