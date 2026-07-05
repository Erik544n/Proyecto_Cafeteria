import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

import CocinaNavigator from './CocinaNavigator';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';

const Tab = createBottomTabNavigator();

// Pantallas placeholder para los otros módulos
function PlaceholderScreen({ title }: { title: string }) {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: 24 }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>🚧</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>{title}</Text>
      <Text style={{ fontSize: 13, color: Colors.textLight, marginTop: 6, textAlign: 'center', marginBottom: 24 }}>
        Las interfaces de este módulo se diseñarán a continuación.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: Colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={logout}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

import { TouchableOpacity } from 'react-native';
import PedidosScreen from '../screens/mesero/PedidosScreen';
import MesasScreen from '../screens/mesero/MesasScreen';

function CajaPlaceholder() { return <PlaceholderScreen title="Módulo Caja" />; }

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { role } = useAuth();

  if (role === null) {
    return <LoginScreen />;
  }

  // Mapeo de pestaña inicial según el rol
  const getInitialTab = () => {
    if (role === 'COCINA') return 'CocinaTab';
    if (role === 'CAJA') return 'CajaTab';
    return 'PedidosTab'; // Mesero por defecto
  };

  return (
    <Tab.Navigator
      key={role} // Fuerza la recreación del navegador para aplicar el initialRouteName
      initialRouteName={getInitialTab()}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="PedidosTab"
        component={PedidosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Pedidos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MesasTab"
        component={MesasScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🪑" label="Mesas" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CocinaTab"
        component={CocinaNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🍳" label="Cocina" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CajaTab"
        component={CajaPlaceholder}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label="Caja" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8ddd0',
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: '#2c1810',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: Colors.accent + '20',
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.tabInactive,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.tabActive,
    fontWeight: '700',
  },
});
