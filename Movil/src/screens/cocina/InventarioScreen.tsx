import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  SafeAreaView, TextInput, ActivityIndicator, Alert, Platform, StatusBar, ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiCocinaGetInventario, apiCocinaGetBajoStock } from '../../services/api';
import { Colors } from '../../theme/colors';

export default function InventarioScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  
  const [inventario, setInventario] = useState<any[]>([]);
  const [bajoStockIds, setBajoStockIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filtro, setFiltro] = useState<'Todos' | 'En Stock' | 'Bajo Stock' | 'Sin Stock'>('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [invRes, bajoStockRes] = await Promise.all([
        apiCocinaGetInventario(token),
        apiCocinaGetBajoStock(token)
      ]);
      
      setInventario(invRes);
      
      const bajoIds = new Set<number>();
      bajoStockRes.forEach((item: any) => bajoIds.add(item.insumo_id));
      setBajoStockIds(bajoIds);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'No se pudo cargar el inventario.');
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  }, [token]);

  // Refrescar al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [fetchData])
  );

  const filteredData = inventario.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    const isOutOfStock = item.stock_actual <= 0;
    const isLowStock = bajoStockIds.has(item.insumo_id) && !isOutOfStock;
    
    if (filtro === 'Sin Stock') return isOutOfStock;
    if (filtro === 'Bajo Stock') return isLowStock;
    if (filtro === 'En Stock') return !isOutOfStock && !isLowStock;
    
    return true; // 'Todos'
  });

  const totalItems = inventario.length;
  const outOfStockCount = inventario.filter(i => i.stock_actual <= 0).length;
  const lowStockCount = bajoStockIds.size;

  const renderItem = ({ item }: { item: any }) => {
    const isOutOfStock = item.stock_actual <= 0;
    const isLowStock = bajoStockIds.has(item.insumo_id) && !isOutOfStock;
    
    // Calculate progress bar percentage
    const min = item.stock_minimo > 0 ? item.stock_minimo : 1;
    const maxStock = min * 2.5; 
    const percentage = Math.min(100, Math.max(0, (item.stock_actual / maxStock) * 100));
    
    let progressColor = '#10b981'; // Green
    let statusText = 'En Stock';
    let statusColor = '#10b981';
    let statusBg = '#d1fae5';

    if (isOutOfStock) {
      progressColor = '#ef4444'; // Red
      statusText = 'Sin Stock';
      statusColor = '#ef4444';
      statusBg = '#fee2e2';
    } else if (isLowStock) {
      progressColor = '#f59e0b'; // Yellow
      statusText = 'Bajo Stock';
      statusColor = '#f59e0b';
      statusBg = '#fef3c7';
    }
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{item.nombre}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.stockInfo}>
          <View>
            <Text style={styles.stockLabel}>Stock Actual</Text>
            <Text style={[styles.stockValue, { color: isOutOfStock ? '#ef4444' : Colors.textPrimary }]}>
              {item.stock_actual} {item.unidad_id || 'u'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.stockLabel}>Stock Mínimo</Text>
            <Text style={styles.stockValueSec}>{item.stock_minimo} {item.unidad_id || 'u'}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: progressColor }]} />
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.costLabel}>Costo Unitario</Text>
          <Text style={styles.costValue}>${Number(item.costo_unitario).toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventario</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Insumos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Bajo Stock</Text>
        </View>
        <View style={[styles.statBox, { borderRightWidth: 0 }]}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Sin Stock</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ingrediente o insumo..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {['Todos', 'En Stock', 'Bajo Stock', 'Sin Stock'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filtro === f && styles.filterChipActive]}
                onPress={() => setFiltro(f as any)}
              >
                <Text style={[styles.filterChipText, filtro === f && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* List */}
      {loading && inventario.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 12, color: Colors.textSecondary, fontSize: 14 }}>Cargando inventario...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.insumo_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => fetchData(true)} 
              colors={[Colors.primary]} 
              tintColor={Colors.primary} 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={56} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>Inventario vacío</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No se encontraron resultados para tu búsqueda.' : 'No hay insumos registrados en el sistema.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ebe5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0ebe5',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.background,
    paddingBottom: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8ddd0',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearIcon: {
    padding: 4,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#e8ddd0',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0ebe5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  stockValueSec: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f5f0eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f0eb',
    paddingTop: 12,
  },
  costLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
