import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import {
  MESAS_MOCK,
  CATALOGO_MOCK,
  PEDIDOS_EN_CURSO_MOCK,
  ProductoCatalogo,
} from '../../data/mockData';

interface Props {
  navigation: any;
}

export default function PedidosScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [activeMesa, setActiveMesa] = useState('04');
  const [categoria, setCategoria] = useState<'Cafeteria' | 'Panaderia' | 'Brunch'>('Cafeteria');
  const [busqueda, setBusqueda] = useState('');
  
  // Estado del carrito (simulado para el nuevo pedido)
  const [cart, setCart] = useState<Record<string, number>>({
    'c1': 2, // 2x Flat White
  });

  const getCartCount = () => Object.values(cart).reduce((sum, count) => sum + count, 0);
  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, count]) => {
      const prod = CATALOGO_MOCK.find(p => p.id === id);
      return sum + (prod ? prod.precio * count : 0);
    }, 0);
  };

  const addToCart = (id: string) => {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const filteredProducts = CATALOGO_MOCK.filter(p => {
    const matchCat = p.categoria === categoria;
    const matchSearch = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={logout} activeOpacity={0.8} style={styles.logoutBtn}>
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
        
        <Text style={styles.appName}>BrewMaster Ops</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.activeMesaBadge}>
            <Text style={styles.activeMesaText}>M{activeMesa}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Sección Mesas */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Mesas</Text>
          <Text style={styles.sectionSub}>PLANTA BAJA</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mesasScroll} contentContainerStyle={styles.mesasContent}>
          {MESAS_MOCK.filter(m => m.area === 'PLANTA_BAJA').slice(0, 4).map(m => {
            const esActiva = m.numero === activeMesa;
            const esOcupada = m.estado === 'OCUPADA';
            
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.mesaCard,
                  esOcupada && styles.mesaCardOcupada,
                  esActiva && styles.mesaCardActiva,
                ]}
                onPress={() => setActiveMesa(m.numero)}
                activeOpacity={0.85}
              >
                <Text style={[styles.mesaNumero, (esActiva || esOcupada) && styles.textWhite]}>{m.numero}</Text>
                <Text style={[styles.mesaEstado, esActiva ? styles.textActiveLabel : esOcupada ? styles.textOcupadaLabel : styles.textLibreLabel]}>
                  {m.estado === 'OCUPADA' ? 'Ocupada' : 'Libre'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sección Pedidos en Curso */}
        <Text style={styles.seccionLabel}>PEDIDOS EN CURSO</Text>
        <View style={styles.pedidosCursoContainer}>
          {PEDIDOS_EN_CURSO_MOCK.map(pedido => (
            <View key={pedido.id} style={[styles.pedidoCursoCard, pedido.estado === 'LISTO' ? styles.pedidoListoBorder : styles.pedidoPrepBorder]}>
              <View style={styles.pedidoCursoLeft}>
                <Text style={styles.pedidoCursoMesa}>{pedido.mesa} •</Text>
                <Text style={styles.pedidoCursoResumen} numberOfLines={1}>{pedido.resumen}</Text>
              </View>
              <View style={styles.pedidoCursoRight}>
                <View style={[styles.statusBadge, pedido.estado === 'LISTO' ? styles.statusBadgeListo : styles.statusBadgePrep]}>
                  <Text style={[styles.statusBadgeText, pedido.estado === 'LISTO' ? styles.statusTextListo : styles.statusTextPrep]}>
                    {pedido.estado}
                  </Text>
                </View>
                <Text style={styles.pedidoCursoTiempo}>{pedido.tiempo}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sección Catálogo */}
        <View style={styles.catalogoHeaderRow}>
          <Text style={styles.sectionTitle}>Catálogo</Text>
          <TouchableOpacity style={styles.searchBarToggle} onPress={() => {}}>
            <Text style={styles.searchBarIcon}>🔍 Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <View style={styles.categoriesRow}>
          {(['Cafeteria', 'Panaderia', 'Brunch'] as const).map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, categoria === cat && styles.categoryChipActive]}
              onPress={() => setCategoria(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, categoria === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Búsqueda */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar en ${categoria}...`}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* Grid de Productos */}
        <View style={styles.productsGrid}>
          {filteredProducts.map(prod => (
            <View key={prod.id} style={styles.productCard}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: prod.imagenUrl }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.addButtonCircle}
                  onPress={() => addToCart(prod.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addBtnIcon}>＋</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.productNombre}>{prod.nombre}</Text>
              <Text style={styles.productPrecio}>${prod.precio.toFixed(0)} MXN</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Barra Flotante de Nuevo Pedido */}
      {getCartCount() > 0 && (
        <View style={styles.floatingCartContainer}>
          <View style={styles.floatingCartCard}>
            <View style={styles.cartBadgeContainer}>
              <View style={styles.cartCountCircle}>
                <Text style={styles.cartCountText}>{getCartCount()}</Text>
              </View>
              <View>
                <Text style={styles.cartMesaTitle}>Mesa {activeMesa} —</Text>
                <Text style={styles.cartTotalText}>${getCartTotal().toFixed(0)} MXN</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.enviarComandaBtn}
              onPress={() => {
                Alert.alert('Pedido enviado', '¡Tu nuevo pedido fue enviado a cocina!');
                setCart({});
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.enviarComandaText}>Enviar Nuevo Pedido</Text>
              <Text style={styles.comandaForkIcon}>🍽</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF6F0', // Fondo crema claro premium
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
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'serif',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
  },
  bellIcon: {
    fontSize: 20,
  },
  activeMesaBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeMesaText: {
    fontWeight: '800',
    color: Colors.primary,
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'serif',
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1,
  },
  mesasScroll: {
    marginBottom: 20,
  },
  mesasContent: {
    gap: 10,
  },
  mesaCard: {
    width: 76,
    height: 76,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8ddd0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mesaCardOcupada: {
    backgroundColor: '#F7CBB0', // naranja claro de ocupado
    borderColor: '#E8A583',
  },
  mesaCardActiva: {
    backgroundColor: Colors.accent, // activo (selección)
    borderColor: Colors.primary,
  },
  mesaNumero: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mesaEstado: {
    fontSize: 10,
    fontWeight: '700',
  },
  textWhite: {
    color: Colors.primary,
  },
  textActiveLabel: {
    color: Colors.primary,
  },
  textOcupadaLabel: {
    color: '#8A4A28',
  },
  textLibreLabel: {
    color: Colors.textLight,
  },
  seccionLabel: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  pedidosCursoContainer: {
    gap: 10,
    marginBottom: 24,
  },
  pedidoCursoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pedidoListoBorder: {
    borderLeftColor: Colors.listo,
  },
  pedidoPrepBorder: {
    borderLeftColor: Colors.accent,
  },
  pedidoCursoLeft: {
    flex: 1,
    marginRight: 10,
  },
  pedidoCursoMesa: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pedidoCursoResumen: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pedidoCursoRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeListo: {
    backgroundColor: Colors.listoLight,
  },
  statusBadgePrep: {
    backgroundColor: Colors.accentLight + '40',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextListo: {
    color: Colors.listo,
  },
  statusTextPrep: {
    color: Colors.primary,
  },
  pedidoCursoTiempo: {
    fontSize: 11,
    color: Colors.textLight,
  },
  catalogoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBarToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchBarIcon: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  searchBarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    marginBottom: 16,
  },
  searchInput: {
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f0e8e0',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addButtonCircle: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(44, 24, 16, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  productNombre: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  productPrecio: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    paddingHorizontal: 4,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 84, // Arriba de la barra de pestañas
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  floatingCartCard: {
    backgroundColor: '#2c1810',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartCountCircle: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: '#2c1810',
    fontSize: 12,
    fontWeight: '800',
  },
  cartMesaTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  cartTotalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  enviarComandaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  enviarComandaText: {
    color: '#2c1810',
    fontWeight: '800',
    fontSize: 12,
  },
  comandaForkIcon: {
    fontSize: 14,
  },
});
