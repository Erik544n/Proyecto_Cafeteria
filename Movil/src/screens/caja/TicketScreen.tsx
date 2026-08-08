import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { CajaStackParamList } from './CuentasActivasScreen';

type TicketRouteProp = RouteProp<CajaStackParamList, 'Ticket'>;

export default function TicketScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CajaStackParamList>>();
  const route = useRoute<TicketRouteProp>();
  const { ticketData } = route.params;

  const handleNuevaVenta = () => {
    navigation.navigate('CuentasActivas');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ticket Generado</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.ticketCard}>
            <Text style={styles.brand}>☕ BrewMaster Ops</Text>
            <Text style={styles.subtitle}>Comprobante de Venta</Text>
            
            <Text style={styles.separator}>----------------------------------------</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Ticket:</Text>
              <Text style={styles.value}>V-{ticketData.venta_id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pedido:</Text>
              <Text style={styles.value}>#{ticketData.pedido_id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{new Date(ticketData.creado_en).toLocaleString()}</Text>
            </View>

            <Text style={styles.separator}>----------------------------------------</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Subtotal:</Text>
              <Text style={styles.value}>${Number(ticketData.subtotal).toFixed(2)}</Text>
            </View>
            {Number(ticketData.descuento) > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Descuento:</Text>
                <Text style={styles.value}>-${Number(ticketData.descuento).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>IVA (16%):</Text>
              <Text style={styles.value}>${Number(ticketData.impuesto).toFixed(2)}</Text>
            </View>
            
            <Text style={styles.separator}>----------------------------------------</Text>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>${Number(ticketData.total).toFixed(2)}</Text>
            </View>

            <Text style={styles.separator}>----------------------------------------</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Método de Pago:</Text>
              <Text style={styles.value}>{ticketData.metodo_pago}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Monto Pagado:</Text>
              <Text style={styles.value}>${Number(ticketData.monto_pagado).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cambio:</Text>
              <Text style={styles.value}>${Number(ticketData.cambio).toFixed(2)}</Text>
            </View>

            <Text style={styles.separator}>----------------------------------------</Text>
            
            <Text style={styles.footerText}>¡Gracias por su compra!</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleNuevaVenta}>
            <Text style={styles.btnText}>NUEVA VENTA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: Colors.background },
  backButton: { padding: 5 },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, alignItems: 'center' },
  ticketCard: { backgroundColor: '#ffffff', width: '100%', maxWidth: 400, padding: 20, borderRadius: 5, elevation: 5, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: {width: 0, height: 4} },
  brand: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#000', marginBottom: 5, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#555', marginBottom: 15, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  separator: { textAlign: 'center', color: '#888', marginVertical: 10, letterSpacing: -0.5, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  label: { fontSize: 14, color: '#333', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  value: { fontSize: 14, color: '#000', fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#000', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  footerText: { textAlign: 'center', marginTop: 20, fontSize: 14, fontWeight: 'bold', color: '#000', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  footer: { padding: 20, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  btn: { backgroundColor: Colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', width: '100%' },
  btnText: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 }
});
