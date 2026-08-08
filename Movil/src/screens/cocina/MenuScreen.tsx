import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { MENU_MOCK } from '../../data/mockData';

interface Props {
  navigation: any;
}

const CATEGORIAS = ['Todos', 'Brunch', 'Desayunos', 'Saludable', 'Sandwiches', 'Panadería'];

export default function MenuScreen({ navigation }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');

  const menuFiltrado = MENU_MOCK.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoria === 'Todos' || p.categoria === categoria;
    return matchBusqueda && matchCategoria;
  });

  const disponibles = MENU_MOCK.filter(p => p.disponible).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Gestión de Menú</Text>
          <Text style={styles.headerSub}>{disponibles} de {MENU_MOCK.length} disponibles</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Búsqueda */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en el menú..."
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* Filtro de categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriasScroll}
          contentContainerStyle={styles.categoriasContent}
        >
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoriaChip, categoria === cat && styles.categoriaChipActive]}
              onPress={() => setCategoria(cat)}
            >
              <Text style={[styles.categoriaText, categoria === cat && styles.categoriaTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de productos */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lista}>
          {menuFiltrado.map(prod => (
            <View key={prod.id} style={[styles.prodCard, !prod.disponible && styles.prodCardInactivo]}>
              <View style={styles.prodIcon}>
                <Ionicons name="restaurant-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.prodInfo}>
                <Text style={[styles.prodNombre, !prod.disponible && styles.prodNombreInactivo]}>
                  {prod.nombre}
                </Text>
                <Text style={styles.prodCategoria}>{prod.categoria}</Text>
                <Text style={styles.prodPrecio}>${prod.precio.toFixed(2)}</Text>
              </View>
              <View style={styles.prodAcciones}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{prod.disponible ? 'Activo' : 'Inactivo'}</Text>
                  <Switch
                    value={prod.disponible}
                    trackColor={{ false: Colors.border, true: Colors.accent + '80' }}
                    thumbColor={prod.disponible ? Colors.primary : Colors.textLight}
                    ios_backgroundColor={Colors.border}
                    onValueChange={() => {}}
                  />
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 22,
  },
  headerTexts: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.accent,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoriasScroll: {
    marginBottom: 12,
  },
  categoriasContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoriaChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoriaChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoriaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoriaTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  lista: {
    paddingHorizontal: 16,
    gap: 10,
  },
  prodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prodCardInactivo: {
    opacity: 0.5,
  },
  prodIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.accentLight + '40',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodEmoji: {
    fontSize: 22,
  },
  prodInfo: {
    flex: 1,
  },
  prodNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  prodNombreInactivo: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  prodCategoria: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 2,
  },
  prodPrecio: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  prodAcciones: {
    alignItems: 'flex-end',
    gap: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  editBtn: {
    padding: 4,
  },
  editIcon: {
    fontSize: 16,
  },
});
