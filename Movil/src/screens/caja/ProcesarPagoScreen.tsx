import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CajaStackParamList } from '../../navigation/CajaNavigator';

type ProcesarPagoRouteProp = RouteProp<CajaStackParamList, 'ProcesarPago'>;
type CajaNavigationProp = NativeStackNavigationProp<CajaStackParamList, 'ProcesarPago'>;

export default function ProcesarPagoScreen() {
  const navigation = useNavigation<CajaNavigationProp>();
  const route = useRoute<ProcesarPagoRouteProp>();
  const { pedidoId, total } = route.params;

  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState(total.toString());
  const [procesando, setProcesando] = useState(false);

  const cambio = Math.max(0, parseFloat(montoRecibido || '0') - total);
  const isValid = parseFloat(montoRecibido || '0') >= total;

  const handlePagar = () => {
    if (!isValid) return;

    setProcesando(true);
    // Simular llamada API
    setTimeout(() => {
      setProcesando(false);
      
      const mockTicket = {
        venta: {
          venta_id: 'V-802',
          pedido_id: pedidoId,
          metodo_pago: metodoPago,
          subtotal: total / 1.16, // Simulando sin IVA
          impuesto: total - (total / 1.16),
          total: total,
          monto_pagado: parseFloat(montoRecibido),
          cambio: cambio,
          creado_en: new Date().toISOString(),
        },
        pedido: {
          detalles: [
            { producto_id: 'c1', cantidad: 1, subtotal: 68 },
            { producto_id: 'b1', cantidad: 1, subtotal: 115 },
          ]
        }
      };
      
      navigation.replace('Ticket', { ticketData: mockTicket });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backEmoji}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>Procesar Cobro</Text>
            <Text style={styles.headerTitle}>Pedido #{pedidoId}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total a cobrar</Text>
            <Text style={styles.summaryAmount}>${total.toFixed(2)} MXN</Text>
          </View>

          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <View style={styles.methodsContainer}>
            <TouchableOpacity 
              style={[styles.methodBtn, metodoPago === 'EFECTIVO' && styles.methodBtnActive]}
              onPress={() => setMetodoPago('EFECTIVO')}
            >
              <Text style={styles.methodEmoji}>💵</Text>
              <Text style={[styles.methodText, metodoPago === 'EFECTIVO' && styles.methodTextActive]}>Efectivo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.methodBtn, metodoPago === 'TARJETA' && styles.methodBtnActive]}
              onPress={() => { setMetodoPago('TARJETA'); setMontoRecibido(total.toString()); }}
            >
              <Text style={styles.methodEmoji}>💳</Text>
              <Text style={[styles.methodText, metodoPago === 'TARJETA' && styles.methodTextActive]}>Tarjeta</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.methodBtn, metodoPago === 'TRANSFERENCIA' && styles.methodBtnActive]}
              onPress={() => { setMetodoPago('TRANSFERENCIA'); setMontoRecibido(total.toString()); }}
            >
              <Text style={styles.methodEmoji}>📱</Text>
              <Text style={[styles.methodText, metodoPago === 'TRANSFERENCIA' && styles.methodTextActive]}>Transf.</Text>
            </TouchableOpacity>
          </View>

          {metodoPago === 'EFECTIVO' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monto Recibido</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={montoRecibido}
                  onChangeText={setMontoRecibido}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.cambioContainer}>
                <Text style={styles.cambioLabel}>Cambio a devolver:</Text>
                <Text style={[styles.cambioAmount, !isValid && { color: Colors.danger }]}>
                  ${cambio.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.payBtn, (!isValid || procesando) && styles.payBtnDisabled]}
            onPress={handlePagar}
            disabled={!isValid || procesando}
          >
            <Text style={styles.payBtnText}>
              {procesando ? 'PROCESANDO...' : 'CONFIRMAR PAGO'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backEmoji: { fontSize: 20, color: '#FFF' },
  headerTextContainer: { flex: 1 },
  headerSubtitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  content: { padding: 20 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  summaryLabel: { color: Colors.textLight, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  summaryAmount: { color: Colors.primary, fontSize: 40, fontWeight: '900' },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  methodsContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  methodBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.1)' },
  methodEmoji: { fontSize: 24, marginBottom: 8 },
  methodText: { color: Colors.textLight, fontSize: 13, fontWeight: '700' },
  methodTextActive: { color: Colors.primary },
  inputContainer: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 32 },
  inputLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700', marginRight: 8 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 32, fontWeight: '900', paddingVertical: 16 },
  cambioContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  cambioLabel: { color: Colors.textLight, fontSize: 16, fontWeight: '600' },
  cambioAmount: { color: '#4ADE80', fontSize: 24, fontWeight: '900' },
  payBtn: { backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  payBtnDisabled: { backgroundColor: Colors.surface, opacity: 0.7 },
  payBtnText: { color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
