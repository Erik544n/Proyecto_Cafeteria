import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { apiCajaProcesarPago } from '../../services/api';
import { CajaStackParamList } from './CuentasActivasScreen';

type ProcesarPagoRouteProp = RouteProp<CajaStackParamList, 'ProcesarPago'>;

export default function ProcesarPagoScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<CajaStackParamList>>();
  const route = useRoute<ProcesarPagoRouteProp>();
  const { pedidoId, total } = route.params;

  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState('');
  const [descuento, setDescuento] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = Number(total);
  const descNum = Number(descuento) || 0;
  const subtotalConDesc = Math.max(0, subtotal - descNum);
  const iva = subtotalConDesc * 0.16;
  const totalFinal = subtotalConDesc + iva;
  
  const montoPagadoNum = metodoPago === 'EFECTIVO' ? Number(montoPagado) : totalFinal;
  const cambio = metodoPago === 'EFECTIVO' ? Math.max(0, montoPagadoNum - totalFinal) : 0;

  const handleMethodChange = (method: string) => {
    setMetodoPago(method);
    if (method !== 'EFECTIVO') {
      setMontoPagado(totalFinal.toFixed(2));
    } else {
      setMontoPagado('');
    }
  };

  const handleConfirm = async () => {
    if (metodoPago === 'EFECTIVO' && (montoPagadoNum < totalFinal || isNaN(montoPagadoNum))) {
      Alert.alert('Error', 'El monto pagado es insuficiente o inválido.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        pedido_id: Number(pedidoId),
        metodo_pago: metodoPago,
        monto_pagado: montoPagadoNum,
        descuento: descNum
      };
      const response = await apiCajaProcesarPago(token, payload);
      navigation.replace('Ticket', { ticketData: response });
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Cobro</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Procesar Pago</Text>
        <Text style={styles.subtitle}>Pedido #{pedidoId}</Text>
        
        <Text style={styles.sectionLabel}>Método de Pago</Text>
        <View style={styles.methodsRow}>
          {['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].map(method => (
            <TouchableOpacity 
              key={method} 
              style={[styles.methodPill, metodoPago === method && styles.methodPillActive]}
              onPress={() => handleMethodChange(method)}
            >
              <Text style={[styles.methodText, metodoPago === method && styles.methodTextActive]}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {metodoPago === 'EFECTIVO' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monto Recibido ($)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0.00"
              value={montoPagado}
              onChangeText={setMontoPagado}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descuento Opcional ($)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0.00"
            value={descuento}
            onChangeText={setDescuento}
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {descNum > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Descuento:</Text>
              <Text style={[styles.summaryValue, { color: Colors.accent }]}>-${descNum.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IVA (16%):</Text>
            <Text style={styles.summaryValue}>${iva.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>${totalFinal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monto Pagado:</Text>
            <Text style={styles.summaryValue}>${montoPagadoNum.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.cambioRow]}>
            <Text style={styles.cambioLabel}>Cambio:</Text>
            <Text style={styles.cambioValue}>${cambio.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.confirmBtn, (metodoPago === 'EFECTIVO' && (montoPagadoNum < totalFinal)) && styles.confirmBtnDisabled]} 
          onPress={handleConfirm}
          disabled={loading || (metodoPago === 'EFECTIVO' && montoPagadoNum < totalFinal)}
        >
          {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.confirmBtnText}>CONFIRMAR PAGO</Text>}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: Colors.background },
  backButton: { padding: 5 },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 10 },
  methodsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  methodPill: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: 10, marginBottom: 10 },
  methodPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  methodText: { color: Colors.textSecondary, fontWeight: '600' },
  methodTextActive: { color: Colors.surface },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: Colors.textSecondary, marginBottom: 5 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 15, fontSize: 16, color: Colors.textPrimary },
  summaryCard: { backgroundColor: Colors.surface, padding: 20, borderRadius: 15, marginTop: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: {width: 0, height: 2} },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 5, marginBottom: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  cambioRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 5 },
  cambioLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  cambioValue: { fontSize: 18, fontWeight: 'bold', color: Colors.accent },
  footer: { padding: 20, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  confirmBtn: { backgroundColor: Colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: Colors.border },
  confirmBtnText: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 }
});
