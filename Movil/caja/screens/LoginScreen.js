import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

import Button from '../components/Button';
import { colors, radius, spacing } from '../constants/theme';
import { login } from '../services/api';

const AUTHORIZED_ROLES = ['ADMIN', 'CAJERO', 'CAJA'];

function canAccessCaja(rol) {
  const normalizedRol = String(rol || '').trim().toUpperCase();
  return AUTHORIZED_ROLES.includes(normalizedRol);
}

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setFormError('');

    if (!cleanEmail || !password) {
      setFormError('Ingresa email y contrasena.');
      Alert.alert('Datos incompletos', 'Ingresa email y contrasena.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setFormError('Revisa el formato del correo.');
      Alert.alert('Email invalido', 'Revisa el formato del correo.');
      return;
    }

    setLoading(true);
    try {
      const session = await login(cleanEmail, password);
      if (!canAccessCaja(session?.rol)) {
        const message = `Acceso denegado. El modulo de Caja solo permite usuarios con rol Caja o Administrador. Rol actual: ${session?.rol || 'sin rol'}.`;
        setFormError(message);
        Alert.alert('Acceso denegado', message);
        return;
      }

      onLogin(session);
    } catch (error) {
      setFormError(error.message || 'Credenciales incorrectas.');
      Alert.alert('No se pudo iniciar sesion', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/icon.png')}
      resizeMode="cover"
      imageStyle={{ opacity: 0.08 }}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', padding: spacing.lg }}
        >
          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ color: colors.primaryDark, fontSize: 36, fontWeight: '900' }}>
                Caja
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
                Inicia sesion para cobrar pedidos pendientes y emitir tickets.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderCurve: 'continuous',
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing.md,
              }}
            >
              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ color: colors.text, fontWeight: '800' }}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="cajero@cafeteria.com"
                  placeholderTextColor={colors.muted}
                  style={inputStyle}
                />
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ color: colors.text, fontWeight: '800' }}>
                  Contrasena
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Ingresa tu contrasena"
                  placeholderTextColor={colors.muted}
                  style={inputStyle}
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {formError ? (
                <View
                  style={{
                    backgroundColor: '#ffdad6',
                    borderColor: colors.danger,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    padding: spacing.sm,
                  }}
                >
                  <Text selectable style={{ color: '#93000a', fontWeight: '800' }}>
                    {formError}
                  </Text>
                </View>
              ) : null}

              <Button title="Iniciar sesion" onPress={handleSubmit} loading={loading} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const inputStyle = {
  minHeight: 52,
  borderRadius: radius.md,
  borderCurve: 'continuous',
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.surfaceMuted,
  color: colors.text,
  paddingHorizontal: spacing.md,
  fontSize: 16,
};
