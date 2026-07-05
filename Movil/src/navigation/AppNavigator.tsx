import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

import CocinaNavigator from './CocinaNavigator';

const Tab = createBottomTabNavigator();

// Pantallas placeholder para los otros módulos
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>🚧</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>{title}</Text>
      <Text style={{ fontSize: 13, color: Colors.textLight, marginTop: 6 }}>Próximamente</Text>
    </View>
  );
}

function PedidosPlaceholder() { return <PlaceholderScreen title="Módulo Pedidos" />; }
function MesasPlaceholder() { return <PlaceholderScreen title="Módulo Mesas" />; }
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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="PedidosTab"
        component={PedidosPlaceholder}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Pedidos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MesasTab"
        component={MesasPlaceholder}
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
