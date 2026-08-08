import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

type InicioStackParamList = {
  Mesas: undefined;
  Comensales: { mesaId: number; mesaNumero: number };
  Catalogo: { mesaId: number; mesaNumero: number; numPersonas: number };
};

type NavProp = NativeStackNavigationProp<InicioStackParamList, 'Comensales'>;
type RoutePropType = RouteProp<InicioStackParamList, 'Comensales'>;

export default function ComensalesScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { mesaId, mesaNumero } = route.params;
  const [numPersonas, setNumPersonas] = useState(1);

  const decrement = () => setNumPersonas((n) => Math.max(1, n - 1));
  const increment = () => setNumPersonas((n) => Math.min(20, n + 1));

  const handleContinuar = () => {
    navigation.navigate('Catalogo', { mesaId, mesaNumero, numPersonas });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerSubtitle}>Mesa {mesaNumero}</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Ionicons name="people-outline" size={64} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>¿Cuántas personas?</Text>
        <Text style={styles.subtitle}>
          Indica el número de comensales para la Mesa {mesaNumero}
        </Text>

        {/* Selector */}
        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={[styles.selectorBtn, numPersonas <= 1 && styles.selectorBtnDisabled]}
            onPress={decrement}
            disabled={numPersonas <= 1}
          >
            <Ionicons name="remove" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.numberContainer}>
            <Text style={styles.numberText}>{numPersonas}</Text>
            <Text style={styles.numberLabel}>{numPersonas === 1 ? 'persona' : 'personas'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.selectorBtn, numPersonas >= 20 && styles.selectorBtnDisabled]}
            onPress={increment}
            disabled={numPersonas >= 20}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Accesos rápidos */}
        <View style={styles.quickRow}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.quickBtn, numPersonas === n && styles.quickBtnActive]}
              onPress={() => setNumPersonas(n)}
            >
              <Text style={[styles.quickBtnText, numPersonas === n && styles.quickBtnTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón continuar */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinuar} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>VER CATÁLOGO</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ddd0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingRight: 12 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  selectorBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectorBtnDisabled: { opacity: 0.3 },
  numberContainer: { alignItems: 'center', minWidth: 80 },
  numberText: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 72,
  },
  numberLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginTop: 4 },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: '#e0d5cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  quickBtnTextActive: { color: '#fff' },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1.2 },
});
