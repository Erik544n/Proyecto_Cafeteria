import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiCajaGetGastos, apiCajaCrearGasto, apiCajaEliminarGasto } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIAS_GASTO = [
  { id: 1, nombre: 'Insumos' },
  { id: 2, nombre: 'Servicios' },
  { id: 3, nombre: 'Mantenimiento' },
  { id: 4, nombre: 'Otros' },
];

const UNIDADES_GASTO = ['Cajas', 'Piezas', 'Paquetes', 'Litros', 'Kilos', 'Unidades'];

export default function GastosScreen() {
  const { token } = useAuth();
  const [gastos, setGastos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [concepto, setConcepto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [unidad, setUnidad] = useState('Cajas');
  const [monto, setMonto] = useState('');
  const [categoriaId, setCategoriaId] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchGastos = async () => {
    if (!token) return;
    try {
      const data = await apiCajaGetGastos(token);
      setGastos(data || []);
    } catch (error: any) {
      console.error('Error cargando gastos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGastos();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGastos();
  };

  const handleCrearGasto = async () => {
    if (!concepto.trim()) {
      Alert.alert('Error', 'Ingresa el concepto del gasto');
      return;
    }
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido mayor a 0');
      return;
    }

    const cantStr = cantidad.trim();
    const conceptoFinal = cantStr && cantStr !== '0'
      ? `${concepto.trim()} (${cantStr} ${unidad})`
      : concepto.trim();

    setSubmitting(true);
    try {
      await apiCajaCrearGasto(token!, {
        categoria_gasto_id: categoriaId,
        concepto: conceptoFinal,
        monto: montoNum,
      });
      Alert.alert('Éxito', 'Gasto registrado correctamente');
      setModalVisible(false);
      setConcepto('');
      setCantidad('1');
      setUnidad('Cajas');
      setMonto('');
      setCategoriaId(1);
      fetchGastos();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo registrar el gasto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarGasto = (gastoId: number, conceptoStr: string) => {
    Alert.alert(
      'Eliminar Gasto',
      `¿Deseas eliminar el gasto "${conceptoStr}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiCajaEliminarGasto(token!, gastoId);
              fetchGastos();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          },
        },
      ]
    );
  };

  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto || 0), 0);

  const renderGasto = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {CATEGORIAS_GASTO.find((c) => c.id === item.categoria_gasto_id)?.nombre || 'Gasto'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleEliminarGasto(item.gasto_id, item.concepto)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.conceptoText}>{item.concepto}</Text>
        <Text style={styles.montoText}>-${Number(item.monto).toFixed(2)}</Text>
      </View>
      <Text style={styles.fechaText}>{item.fecha_gasto || new Date(item.creado_en).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Gastos y Compras</Text>
            <Text style={styles.headerSubtitle}>Registro operativo de Caja</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addBtnText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total de Gastos Registrados</Text>
          <Text style={styles.summaryValue}>-${totalGastos.toFixed(2)}</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={gastos}
            keyExtractor={(item) => String(item.gasto_id)}
            renderItem={renderGasto}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
            }
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={48} color={Colors.textLight} />
                <Text style={styles.emptyText}>No se han registrado gastos aún</Text>
              </View>
            }
          />
        )}

        {/* Modal Registrar Gasto */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Registrar Nuevo Gasto</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Concepto / Insumo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Leche entera, Servilletas..."
                value={concepto}
                onChangeText={setConcepto}
              />

              <View style={styles.rowTwoCols}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Cantidad</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    keyboardType="number-pad"
                    value={cantidad}
                    onChangeText={setCantidad}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Monto Total ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={monto}
                    onChangeText={setMonto}
                  />
                </View>
              </View>

              <Text style={styles.label}>Unidad / Presentación</Text>
              <View style={styles.catRow}>
                {UNIDADES_GASTO.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.catChip,
                      unidad === u && styles.catChipActive,
                    ]}
                    onPress={() => setUnidad(u)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        unidad === u && styles.catChipTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Categoría de Gasto</Text>
              <View style={styles.catRow}>
                {CATEGORIAS_GASTO.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      categoriaId === cat.id && styles.catChipActive,
                    ]}
                    onPress={() => setCategoriaId(cat.id)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        categoriaId === cat.id && styles.catChipTextActive,
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCrearGasto}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>GUARDAR GASTO</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.surface },
  headerSubtitle: { fontSize: 13, color: Colors.accentLight, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  summaryCard: {
    backgroundColor: Colors.surface,
    margin: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 5 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeContainer: {
    backgroundColor: '#fdeae8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#e74c3c' },
  deleteBtn: { padding: 4 },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  conceptoText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: 10 },
  montoText: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c' },
  fechaText: { fontSize: 12, color: Colors.textLight, textAlign: 'right' },
  loader: { marginTop: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', marginTop: 15, color: Colors.textSecondary, fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 5, marginTop: 10 },
  rowTwoCols: { flexDirection: 'row', alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  catChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: 12, color: Colors.textSecondary },
  catChipTextActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
