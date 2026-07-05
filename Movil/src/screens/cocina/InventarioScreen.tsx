import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { INVENTARIO_MOCK } from '../../data/mockData';

interface Props {
  navigation: any;
}

export default function InventarioScreen({ navigation }: Props) {
  const [busqueda, setBusqueda] = React.useState('');

  const inventarioFiltrado = INVENTARIO_MOCK.filter(i =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const sinStock = INVENTARIO_MOCK.filter(i => i.estado === 'sin_stock').length;
  const stockBajo = INVENTARIO_MOCK.filter(i => i.estado === 'stock_bajo').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Inventario</Text>
          <Text style={styles.headerSub}>Control de suministros</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AgregarInsumo')}
        >
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen de alertas */}
      <View style={styles.alertasRow}>
        <View style={styles.alertaItem}>
          <Text style={styles.alertaNum}>{sinStock}</Text>
          <Text style={styles.alertaLabel}>Sin stock</Text>
        </View>
        <View style={styles.alertaSep} />
        <View style={styles.alertaItem}>
          <Text style={[styles.alertaNum, { color: Colors.pendiente }]}>{stockBajo}</Text>
          <Text style={styles.alertaLabel}>Stock bajo</Text>
        </View>
        <View style={styles.alertaSep} />
        <View style={styles.alertaItem}>
          <Text style={[styles.alertaNum, { color: Colors.listo }]}>{INVENTARIO_MOCK.length - sinStock - stockBajo}</Text>
          <Text style={styles.alertaLabel}>En orden</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Búsqueda */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar insumo..."
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.lista}>
          {inventarioFiltrado.map(insumo => {
            const esSinStock = insumo.estado === 'sin_stock';
            const esStockBajo = insumo.estado === 'stock_bajo';
            const porcentaje = Math.min((insumo.stock / insumo.minimo) * 100, 100);

            return (
              <View
                key={insumo.id}
                style={[
                  styles.insumoCard,
                  esSinStock && styles.insumoCardDanger,
                  esStockBajo && styles.insumoCardWarning,
                ]}
              >
                <View style={styles.insumoTop}>
                  <View style={styles.insumoNombreWrap}>
                    <View style={[
                      styles.estadoDot,
                      esSinStock && { backgroundColor: Colors.urgente },
                      esStockBajo && { backgroundColor: Colors.pendiente },
                      !esSinStock && !esStockBajo && { backgroundColor: Colors.listo },
                    ]} />
                    <Text style={styles.insumoNombre}>{insumo.nombre}</Text>
                  </View>
                  <View style={styles.stockWrap}>
                    <Text style={[
                      styles.stockNum,
                      esSinStock && { color: Colors.urgente },
                      esStockBajo && { color: Colors.pendiente },
                    ]}>
                      {insumo.stock}
                    </Text>
                    <Text style={styles.stockUnidad}> {insumo.unidad}</Text>
                  </View>
                </View>

                {/* Barra de progreso */}
                <View style={styles.progressBg}>
                  <View style={[
                    styles.progressFill,
                    { width: `${porcentaje}%` as any },
                    esSinStock && { backgroundColor: Colors.urgente },
                    esStockBajo && { backgroundColor: Colors.pendiente },
                    !esSinStock && !esStockBajo && { backgroundColor: Colors.listo },
                  ]} />
                </View>

                <Text style={styles.minimoTexto}>Mínimo: {insumo.minimo} {insumo.unidad}</Text>
              </View>
            );
          })}
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
  alertasRow: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  alertaItem: {
    alignItems: 'center',
  },
  alertaNum: {
    color: Colors.urgente,
    fontSize: 22,
    fontWeight: '800',
  },
  alertaLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  alertaSep: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  lista: {
    gap: 10,
  },
  insumoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insumoCardDanger: {
    borderColor: Colors.urgenteBorder,
    backgroundColor: Colors.urgenteLight,
  },
  insumoCardWarning: {
    borderColor: Colors.pendienteBorder,
    backgroundColor: Colors.pendienteLight,
  },
  insumoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insumoNombreWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  estadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insumoNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  stockWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockNum: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stockUnidad: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  minimoTexto: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
