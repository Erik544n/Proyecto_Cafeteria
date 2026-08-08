import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiCocinaGetBajoStock } from '../../services/api';

export default function IngredientesInsuficientesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();

  const pedido = route.params?.pedido;
  const [bajoStock, setBajoStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBajoStock = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiCocinaGetBajoStock(token);
      setBajoStock(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBajoStock();
  }, [fetchBajoStock]);

  const totalItems = pedido?.detalles
    ? pedido.detalles.reduce((acc: number, d: any) => acc + d.cantidad, 0)
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Detalle</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ingredientes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alerta */}
        <View style={styles.alertaBanner}>
          <View style={styles.alertaIconWrap}>
            <Ionicons name="warning" size={20} color={Colors.urgente} />
          </View>
          <View style={styles.alertaTexts}>
            <Text style={styles.alertaTitulo}>Ingredientes Insuficientes</Text>
            <Text style={styles.alertaDescripcion}>
              {pedido
                ? `Pedido #${pedido.pedido_id} · Mesa ${pedido.mesa_id ?? 'N/A'}`
                : 'Insumos con stock bajo en el inventario'}
            </Text>
          </View>
        </View>

        {/* Pedido afectado (si existe) */}
        {pedido && (
          <>
            <Text style={styles.sectionTitle}>PEDIDO AFECTADO</Text>
            <View style={styles.pedidoAfectadoCard}>
              <View style={styles.pedidoAfectadoHeader}>
                <View style={styles.bloqueadoBadge}>
                  <Text style={styles.bloqueadoText}>
                    Pedido #{pedido.pedido_id} · Mesa {pedido.mesa_id ?? 'N/A'}
                  </Text>
                </View>
              </View>
              {pedido.detalles?.map((d: any, idx: number) => {
                const nombre = d.producto_nombre || `Producto #${d.producto_id}`;
                return (
                  <Text key={idx} style={styles.productoPedido}>
                    {d.cantidad}x {nombre}
                    {d.observaciones ? ` (${d.observaciones})` : ''}
                  </Text>
                );
              })}
              <View style={styles.pedidoAfectadoFooter}>
                <Text style={styles.pedidoAfectadoItems}>{totalItems} producto(s)</Text>
                <Text style={styles.pedidoAfectadoTotal}>${Number(pedido.total).toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Insumos con stock bajo */}
        <Text style={styles.sectionTitle}>INSUMOS CON STOCK BAJO</Text>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 12, color: Colors.textSecondary, fontSize: 14 }}>Cargando inventario…</Text>
          </View>
        ) : bajoStock.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#16a34a" />
            <Text style={styles.emptyTitle}>Inventario Suficiente</Text>
            <Text style={styles.emptyText}>Todos los insumos tienen stock por encima del mínimo.</Text>
          </View>
        ) : (
          <View style={styles.insumosList}>
            {bajoStock.map((ins: any, idx: number) => {
              const sinStock = ins.cantidad_actual <= 0;
              return (
                <View
                  key={ins.insumo_id || idx}
                  style={[styles.insumoRow, idx < bajoStock.length - 1 && styles.insumoRowBorder]}
                >
                  <View style={[styles.insumoDot, { backgroundColor: sinStock ? '#e53935' : '#f59e0b' }]} />
                  <View style={styles.insumoInfo}>
                    <Text style={styles.insumoNombre}>{ins.nombre}</Text>
                    <Text style={styles.insumoStock}>
                      Disponible: {ins.cantidad_actual} {ins.unidad} · Mínimo: {ins.stock_minimo} {ins.unidad}
                    </Text>
                  </View>
                  <View style={[styles.insumoStatusBadge, { backgroundColor: sinStock ? '#fef2f2' : '#fffbeb' }]}>
                    <Text style={[styles.insumoStatusText, { color: sinStock ? '#e53935' : '#f59e0b' }]}>
                      {sinStock ? 'Sin stock' : 'Bajo'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Leyenda */}
        <View style={styles.leyenda}>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: '#e53935' }]} />
            <Text style={styles.leyendaTexto}>Sin stock</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.leyendaTexto}>Stock bajo</Text>
          </View>
        </View>

        {/* Acciones */}
        <TouchableOpacity
          style={styles.botonNotificar}
          onPress={() => Alert.alert('Notificación enviada', 'Se notificó al administrador sobre el stock insuficiente.')}
          activeOpacity={0.85}
        >
          <Ionicons name="notifications-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.botonNotificarText}>Notificar al Administrador</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.botonVolverText}>Volver al Pedido</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'android' ? 32 : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#e8ddd0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, flex: 1, textAlign: 'right' },
  content: { padding: 16, paddingBottom: 100 },
  alertaBanner: {
    backgroundColor: Colors.urgenteLight, borderRadius: 14, borderWidth: 1, borderColor: Colors.urgenteBorder,
    flexDirection: 'row', padding: 14, alignItems: 'center', marginBottom: 20, gap: 12,
  },
  alertaIconWrap: {
    width: 40, height: 40, backgroundColor: Colors.urgente + '18',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  alertaTexts: { flex: 1 },
  alertaTitulo: { color: Colors.urgente, fontWeight: '800', fontSize: 14 },
  alertaDescripcion: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: Colors.accent, letterSpacing: 1.2, marginBottom: 10,
  },
  pedidoAfectadoCard: {
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.urgenteBorder,
    padding: 14, marginBottom: 20,
  },
  pedidoAfectadoHeader: { marginBottom: 10 },
  bloqueadoBadge: {
    backgroundColor: Colors.urgenteLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  bloqueadoText: { color: Colors.urgente, fontSize: 12, fontWeight: '800' },
  productoPedido: { fontSize: 14, color: Colors.textPrimary, marginBottom: 4, lineHeight: 20 },
  pedidoAfectadoFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#f0ebe5', paddingTop: 10, marginTop: 8,
  },
  pedidoAfectadoItems: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  pedidoAfectadoTotal: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  emptyContainer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginTop: 10, marginBottom: 6 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  insumosList: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  insumoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  insumoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f0ebe5' },
  insumoDot: { width: 10, height: 10, borderRadius: 5 },
  insumoInfo: { flex: 1 },
  insumoNombre: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  insumoStock: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  insumoStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  insumoStatusText: { fontSize: 11, fontWeight: '700' },
  leyenda: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 10, height: 10, borderRadius: 5 },
  leyendaTexto: { fontSize: 12, color: Colors.textSecondary },
  botonNotificar: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  botonNotificarText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  botonVolver: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center', backgroundColor: Colors.surface,
  },
  botonVolverText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 14 },
});
