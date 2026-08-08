import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

import ColaScreen from '../screens/cocina/ColaScreen';
import DetallePedidoScreen from '../screens/cocina/DetallePedidoScreen';
import IngredientesInsuficientesScreen from '../screens/cocina/IngredientesInsuficientesScreen';
import InventarioScreen from '../screens/cocina/InventarioScreen';
import MenuScreen from '../screens/cocina/MenuScreen';
import NotificacionesScreen from '../screens/cocina/NotificacionesScreen';

const ColaStack = createNativeStackNavigator();

function ColaStackNavigator() {
  return (
    <ColaStack.Navigator screenOptions={{ headerShown: false }}>
      <ColaStack.Screen name="ColaMain" component={ColaScreen} />
      <ColaStack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <ColaStack.Screen name="IngredientesInsuficientes" component={IngredientesInsuficientesScreen} />
      <ColaStack.Screen name="Menu" component={MenuScreen} />
      <ColaStack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </ColaStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function CocinaNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="ColaTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e8ddd0',
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
          shadowColor: '#2c1810',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'restaurant';
          if (route.name === 'ColaTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'InventarioTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ColaTab"
        component={ColaStackNavigator}
        options={{ tabBarLabel: 'Cocina' }}
      />
      <Tab.Screen
        name="InventarioTab"
        component={InventarioScreen}
        options={{ tabBarLabel: 'Inventario' }}
      />
    </Tab.Navigator>
  );
}
