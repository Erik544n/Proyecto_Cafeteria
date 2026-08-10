import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiGetProductos, apiCrearPedido } from '../../services/api';

// ─── Tipos ─────────────────────────────────────────────────────
type InicioStackParamList = {
  Mesas: undefined;
  Catalogo: { mesaId: number; mesaNumero: number; capacidad: number };
};

type NavProp = NativeStackNavigationProp<InicioStackParamList, 'Catalogo'>;
type RoutePropType = RouteProp<InicioStackParamList, 'Catalogo'>;

interface Producto {
  producto_id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  categoria_id: number;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
  observaciones: string;
}

const CAT_NAMES: Record<number, string> = {
  1: 'Bebidas Calientes',
  2: 'Bebidas Frías',
  3: 'Alimentos',
  4: 'Postres',
  5: 'Otros',
};

export default function CatalogoScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { mesaId, mesaNumero, capacidad } = route.params;
  const { token } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [obsModal, setObsModal] = useState<{ visible: boolean; productoId: number | null }>({
    visible: false,
    productoId: null,
  });
  const [obsText, setObsText] = useState('');

  const loadProductos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetProductos(token);
      setProductos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', `No se pudo cargar el catálogo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadProductos(); }, [loadProductos]);

  const sections = React.useMemo(() => {
    const groups: Record<number, Producto[]> = {};
    productos.forEach((p) => {
      if (!groups[p.categoria_id]) groups[p.categoria_id] = [];
      groups[p.categoria_id].push(p);
    });
    return Object.entries(groups).map(([catId, items]) => ({
      title: CAT_NAMES[Number(catId)] ?? `Categoría ${catId}`,
      data: items,
    }));
  }, [productos]);

  const getCartItem = (id: number) => cart.find((c) => c.producto.producto_id === id);
  const cartTotal = cart.reduce((sum, c) => sum + c.producto.precio * c.cantidad, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.cantidad, 0);

  const addToCart = (producto: Producto) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.producto.producto_id === producto.producto_id);
      if (existing) {
        return prev.map((c) =>
          c.producto.producto_id === producto.producto_id
            ? { ...c, cantidad: c.cantidad + 1 }
            : c
        );
      }
      return [...prev, { producto, cantidad: 1, observaciones: '' }];
    });
  };

  const removeFromCart = (productoId: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.producto.producto_id === productoId);
      if (existing && existing.cantidad > 1) {
        return prev.map((c) =>
          c.producto.producto_id === productoId ? { ...c, cantidad: c.cantidad - 1 } : c
        );
      }
      return prev.filter((c) => c.producto.producto_id !== productoId);
    });
  };

  const openObsModal = (productoId: number) => {
    const item = cart.find((c) => c.producto.producto_id === productoId);
    setObsText(item?.observaciones ?? '');
    setObsModal({ visible: true, productoId });
  };

  const saveObs = () => {
    if (obsModal.productoId !== null) {
      setCart((prev) =>
        prev.map((c) =>
          c.producto.producto_id === obsModal.productoId
            ? { ...c, observaciones: obsText }
            : c
        )
      );
    }
    setObsModal({ visible: false, productoId: null });
  };

  const handleEnviarPedido = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto antes de enviar el pedido.');
      return;
    }
    Alert.alert(
      'Confirmar Pedido',
      `Mesa ${mesaNumero} · Cap. ${capacidad} personas\nTotal: $${cartTotal.toFixed(2)} MXN`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar a Cocina',
          onPress: async () => {
            if (!token) return;
            setEnviando(true);
            try {
              await apiCrearPedido(token, {
                mesa_id: mesaId,
                num_personas: capacidad,
                detalles: cart.map((c) => ({
                  producto_id: c.producto.producto_id,
                  cantidad: c.cantidad,
                  observaciones: c.observaciones || undefined,
                })),
              });
              Alert.alert(
                '¡Pedido enviado! 🍳',
                `La mesa ${mesaNumero} quedó como OCUPADA.\nEl pedido fue enviado a cocina.`,
                [{ text: 'OK', onPress: () => navigation.navigate('Mesas') }]
              );
              // La mesa se actualiza en el servidor. Al navegar de vuelta a Mesas,
              // useFocusEffect la recargará automáticamente.
            } catch (err: any) {
              Alert.alert('Error al enviar', err.message ?? 'Ocurrió un error inesperado.');
            } finally {
              setEnviando(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando catálogo…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Mesas</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Catálogo</Text>
          <View style={styles.headerSubRow}>
            <Ionicons name="grid-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.headerSub}>Mesa {mesaNumero}</Text>
            <Text style={styles.headerSubSep}>·</Text>
            <Ionicons name="people-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.headerSub}>Cap. {capacidad}</Text>
          </View>
        </View>
      </View>

      {/* Lista de productos por categoría */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.producto_id)}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const cartItem = getCartItem(item.producto_id);
          const qty = cartItem?.cantidad ?? 0;
          return (
            <View style={[styles.productoCard, !item.disponible && styles.productoNoDisponible]}>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{item.nombre}</Text>
                {item.descripcion ? (
                  <Text style={styles.productoDesc}>{item.descripcion}</Text>
                ) : null}
                {!item.disponible && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Ionicons name="warning-outline" size={14} color="#e65100" />
                    <Text style={styles.noDisponibleBadge}>No disponible</Text>
                  </View>
                )}
                <Text style={styles.productoPrecio}>${Number(item.precio).toFixed(2)} MXN</Text>
              </View>
              <View style={styles.qtyControl}>
                {qty > 0 ? (
                  <>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.producto_id)}>
                      <Ionicons name="remove" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyNumber}>{qty}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, styles.qtyBtnAdd]}
                      onPress={() => addToCart(item)}
                      disabled={!item.disponible}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.obsBtn} onPress={() => openObsModal(item.producto_id)}>
                      <Ionicons name="create-outline" size={20} color={cartItem?.observaciones ? Colors.primary : Colors.textLight} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.addBtn, !item.disponible && styles.addBtnDisabled]}
                    onPress={() => addToCart(item)}
                    disabled={!item.disponible}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.addBtnText}>Agregar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Botón flotante del carrito */}
      {cartCount > 0 && (
        <View style={styles.cartBarContainer}>
          <TouchableOpacity
            style={styles.cartBar}
            onPress={handleEnviarPedido}
            disabled={enviando}
            activeOpacity={0.88}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
                <Text style={styles.cartBarText}>ENVIAR PEDIDO A COCINA</Text>
                <Text style={styles.cartBarTotal}>${cartTotal.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de observaciones */}
      <Modal visible={obsModal.visible} transparent animationType="slide">
        <View style={styles.obsOverlay}>
          <View style={styles.obsContainer}>
            <Text style={styles.obsTitle}>Observaciones</Text>
            <Text style={styles.obsSubtitle}>
              {obsModal.productoId !== null
                ? getCartItem(obsModal.productoId)?.producto.nombre
                : ''}
            </Text>
            <TextInput
              style={styles.obsInput}
              multiline
              numberOfLines={3}
              placeholder="Ej: sin cebolla, punto de cocción, alergia a nueces…"
              placeholderTextColor={Colors.textLight}
              value={obsText}
              onChangeText={setObsText}
            />
            <View style={styles.obsActions}>
              <TouchableOpacity
                style={styles.obsCancelBtn}
                onPress={() => setObsModal({ visible: false, productoId: null })}
              >
                <Text style={styles.obsCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.obsSaveBtn} onPress={saveObs}>
                <Text style={styles.obsSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'android' ? 32 : 0 },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
    gap: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingRight: 8 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerSub: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  headerSubSep: { fontSize: 12, color: Colors.textLight, marginHorizontal: 2 },
  listContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { backgroundColor: Colors.background, paddingVertical: 10, paddingTop: 20 },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.accent,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  productoCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productoNoDisponible: { opacity: 0.5 },
  productoInfo: { flex: 1, marginRight: 12 },
  productoNombre: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  productoDesc: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4, lineHeight: 16 },
  noDisponibleBadge: { fontSize: 11, color: '#e65100', fontWeight: '700' },
  productoPrecio: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0ebe5',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnAdd: { backgroundColor: Colors.primary },
  qtyNumber: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },
  obsBtn: { paddingHorizontal: 4 },
  addBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, flexDirection: 'row', alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: '#ccc' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cartBarContainer: { position: 'absolute', bottom: 90, left: 16, right: 16 },
  cartBar: {
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  cartBadge: {
    backgroundColor: Colors.accent, width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cartBadgeText: { color: Colors.primary, fontWeight: '900', fontSize: 13 },
  cartBarText: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.8 },
  cartBarTotal: { color: Colors.accent, fontWeight: '900', fontSize: 16 },
  obsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  obsContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  obsTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  obsSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  obsInput: {
    backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: '#e0d5cc',
    padding: 14, fontSize: 14, color: Colors.textPrimary,
    textAlignVertical: 'top', minHeight: 90, marginBottom: 20,
  },
  obsActions: { flexDirection: 'row', gap: 12 },
  obsCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e0d5cc', alignItems: 'center' },
  obsCancelText: { color: Colors.textSecondary, fontWeight: '700' },
  obsSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  obsSaveText: { color: '#fff', fontWeight: '800' },
});
