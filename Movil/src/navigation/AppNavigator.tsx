import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import CocinaNavigator from './CocinaNavigator';
import MeseroNavigator from './MeseroNavigator';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import { Colors } from '../theme/colors';

function PlaceholderScreen({ title }: { title: string }) {
  const { logout } = useAuth();

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderIcon}>🚧</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Este modulo sigue pendiente dentro de la demo.</Text>
      <TouchableOpacity style={styles.placeholderButton} onPress={logout} activeOpacity={0.85}>
        <Text style={styles.placeholderButtonText}>CERRAR SESION</Text>
      </TouchableOpacity>
    </View>
  );
}

function CajaPlaceholder() {
  return <PlaceholderScreen title="Modulo Caja" />;
}

export default function AppNavigator() {
  const { role } = useAuth();

  if (role === null) {
    return <LoginScreen />;
  }

  if (role === 'MESERO') {
    return <MeseroNavigator />;
  }

  if (role === 'COCINA') {
    return <CocinaNavigator />;
  }

  return <CajaPlaceholder />;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholderText: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 6,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  placeholderButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  placeholderButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
