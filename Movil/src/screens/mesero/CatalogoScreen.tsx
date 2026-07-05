import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { CATALOGO_MOCK, ProductoCatalogo } from '../../data/mockData';
import { useMesero, PedidoMeseroItem } from '../../context/MeseroContext';

interface Props {
  navigation: any;
}

const CATEGORIAS = ['Cafeteria', 'Panaderia', 'Brunch'] as const;

export default function CatalogoScreen({ navigation }: Props) {
  const { mesaActiva, crearPedido } = useMesero();
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number]>('Cafeteria');
  const [busqueda, setBusqueda] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  const productosFiltrados = useMemo(
    () =>
      CATALOGO_MOCK.filter(producto => {
        const coincideCategoria = producto.categoria === categoria;
        const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
      }),
    [categoria, busqueda],
  );

  const cartCount = Object.values(cart).reduce((sum, cantidad) => sum + cantidad, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, cantidad]) => {
    const producto = CATALOGO_MOCK.find(item => item.id === id);
    return sum + (producto ? producto.precio * cantidad : 0);
  }, 0);

  const addToCart = (producto: ProductoCatalogo) => {
    setCart(prev => ({
      ...prev,
      [producto.id]: (prev[producto.id] || 0) + 1,
    }));
  };

  const buildPedidoItems = (): PedidoMeseroItem[] =>
    Object.entries(cart)
      .map(([id, cantidad]) => ({
        producto: CATALOGO_MOCK.find(item => item.id === id),
        cantidad,
      }))
      .filter((item): item is PedidoMeseroItem => Boolean(item.producto));

  const handleSendOrder = () => {
    if (!mesaActiva || mesaActiva.estado !== 'LIBRE') {
      Alert.alert('Selecciona una mesa libre', 'Regresa a Mesas y elige una mesa libre primero.');
      return;
    }

    const pedido = crearPedido(buildPedidoItems());

    if (!pedido) {
      Alert.alert('Carrito vacio', 'Agrega productos antes de enviar el pedido.');
      return;
    }

    setCart({});
    navigation.navigate('Pedidos');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Mesas')} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Mesas</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Catalogo</Text>
          <Text style={styles.headerSubtitle}>
            {mesaActiva ? `Mesa ${mesaActiva.numero} lista para ordenar` : 'Selecciona una mesa primero'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Pedidos')} activeOpacity={0.8} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Pedido</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Busca y agrega productos</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <View style={styles.categoriesRow}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, categoria === cat && styles.categoryChipActive]}
              onPress={() => setCategoria(cat)}
              activeOpacity={0.85}
            >
              <Text style={[styles.categoryText, categoria === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.productsGrid}>
          {productosFiltrados.map(producto => (
            <View key={producto.id} style={styles.productCard}>
              <View style={styles.productImageWrap}>
                <Image source={{ uri: producto.imagenUrl }} style={styles.productImage} />
                <TouchableOpacity style={styles.addButton} onPress={() => addToCart(producto)} activeOpacity={0.85}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.productName}>{producto.nombre}</Text>
              <Text style={styles.productPrice}>${producto.precio.toFixed(0)} MXN</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartLabel}>{cartCount} productos</Text>
            <Text style={styles.cartTotal}>Total ${cartTotal.toFixed(0)} MXN</Text>
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={handleSendOrder} activeOpacity={0.85}>
            <Text style={styles.sendButtonText}>ENVIAR PEDIDO</Text>
          </TouchableOpacity>
        </View>
      )}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  searchCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchLabel: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
  },
  productImageWrap: {
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: -1,
  },
  productName: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  productPrice: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    marginTop: 4,
  },
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cartLabel: {
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '700',
  },
  cartTotal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  sendButton: {
    backgroundColor: Colors.listo,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
});