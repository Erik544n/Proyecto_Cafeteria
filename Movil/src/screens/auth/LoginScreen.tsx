import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth, UserRole } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }
    setError('');
    // Simular inicio de sesión según el correo o por defecto
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('cocina')) {
      login('COCINA');
    } else if (lowerEmail.includes('caja')) {
      login('CAJA');
    } else {
      login('MESERO'); // Por defecto mesero
    }
  };

  const selectQuickRole = (role: UserRole) => {
    setError('');
    login(role);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo y Encabezado */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>☕</Text>
            </View>
            <Text style={styles.appName}>BrewMaster Ops</Text>
            <Text style={styles.appSub}>Gestión de Cafetería Premium</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@cafeteria.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginBtnText}>INGRESAR</Text>
            </TouchableOpacity>
          </View>

          {/* Selector de Roles para Demo */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Simular Rol (Prototipo)</Text>
            <Text style={styles.demoSub}>Toca un rol para ingresar directamente sin escribir credenciales:</Text>

            <View style={styles.rolesRow}>
              <TouchableOpacity
                style={[styles.roleChip, { backgroundColor: Colors.accent }]}
                onPress={() => selectQuickRole('MESERO')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleChipEmoji}>📱</Text>
                <Text style={styles.roleChipText}>Mesero</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleChip, { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.accent }]}
                onPress={() => selectQuickRole('COCINA')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleChipEmoji}>🍳</Text>
                <Text style={[styles.roleChipText, { color: '#ffffff' }]}>Cocina</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleChip, { backgroundColor: Colors.listo }]}
                onPress={() => selectQuickRole('CAJA')}
                activeOpacity={0.8}
              >
                <Text style={styles.roleChipEmoji}>💰</Text>
                <Text style={styles.roleChipText}>Caja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: Colors.accent + '20',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSub: {
    color: Colors.accentLight,
    fontSize: 14,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.urgente,
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputWrap: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  demoContainer: {
    marginTop: 36,
    alignItems: 'center',
  },
  demoTitle: {
    color: Colors.accentLight,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  demoSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleChipEmoji: {
    fontSize: 16,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
