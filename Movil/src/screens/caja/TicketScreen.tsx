import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CajaStackParamList } from '../../navigation/CajaNavigator';

type TicketRouteProp = RouteProp<CajaStackParamList, 'Ticket'>;
type CajaNavigationProp = NativeStackNavigationProp<CajaStackParamList, 'Ticket'>;

export default function TicketScreen() {
  const navigation = useNavigation<CajaNavigationProp>();
  const route = useRoute<TicketRouteProp>();
  const { ticketData } = route.params;
  const { venta, pedido } = ticketData;

  const handleDone = () => {
    navigation.navigate('CuentasActivas');
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>Venta Exitosa</Text>
          <Text style={styles.headerTitle}>Ticket Generado</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ticketCard}>
          {/* Logo / Header Ticket */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketLogo}>☕️ BrewMaster</Text>
            <Text style={styles.ticketMuted}>Ticket #{venta.venta_id}</Text>
            <Text style={styles.ticketMuted}>Fecha: {formatDate(venta.creado_en)}</Text>
            <Text style={styles.ticketMuted}>Pedido: #{venta.pedido_id}</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Detalles de productos */}
          {pedido.detalles.map((item: any, index: number) => (
            <View key={index} style={styles.ticketRow}>
              <Text style={styles.ticketText}>{item.cantidad}x Prod #{item.producto_id}</Text>
              <Text style={styles.ticketTextStrong}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.divider} />
          
          {/* Totales */}
          <View style={styles.ticketRow}>
            <Text style={styles.ticketText}>Subtotal</Text>
            <Text style={styles.ticketText}>${venta.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketText}>IVA (16%)</Text>
            <Text style={styles.ticketText}>${venta.impuesto.toFixed(2)}</Text>
          </View>
          
          <View style={styles.ticketRow}>
            <Text style={styles.ticketTotalLabel}>TOTAL</Text>
            <Text style={styles.ticketTotalValue}>${venta.total.toFixed(2)} MXN</Text>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.ticketRow}>
            <Text style={styles.ticketText}>Método de Pago</Text>
            <Text style={styles.ticketTextStrong}>{venta.metodo_pago}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketText}>Monto Pagado</Text>
            <Text style={styles.ticketTextStrong}>${venta.monto_pagado.toFixed(2)}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketText}>Cambio</Text>
            <Text style={styles.ticketTextStrong}>${venta.cambio.toFixed(2)}</Text>
          </View>

          <View style={styles.ticketFooter}>
            <Text style={styles.ticketMuted}>¡Gracias por tu preferencia!</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newBtn} onPress={handleDone}>
          <Text style={styles.newBtnText}>NUEVA VENTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerSubtitle: { color: '#4ADE80', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 60 },
  
  ticketCard: {
    backgroundColor: '#FFFFFF', // El ticket simula papel blanco
    borderRadius: 8,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  ticketHeader: { alignItems: 'center', marginBottom: 16 },
  ticketLogo: { color: '#000', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  ticketMuted: { color: '#666', fontSize: 13, marginBottom: 2, fontFamily: 'monospace' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD', borderRadius: 1 },
  
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketText: { color: '#333', fontSize: 14, fontFamily: 'monospace' },
  ticketTextStrong: { color: '#000', fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },
  
  ticketTotalLabel: { color: '#000', fontSize: 18, fontWeight: '900', marginTop: 8 },
  ticketTotalValue: { color: '#000', fontSize: 18, fontWeight: '900', marginTop: 8 },
  
  ticketFooter: { alignItems: 'center', marginTop: 24 },
  
  newBtn: { backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  newBtnText: { color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
