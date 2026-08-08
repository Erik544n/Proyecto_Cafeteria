import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// Pantallas del Mesero
import MesasScreen from '../screens/mesero/MesasScreen';
import PedidosScreen from '../screens/mesero/PedidosScreen';
import CatalogoScreen from '../screens/mesero/CatalogoScreen';
import DetallePedidoMeseroScreen from '../screens/mesero/DetallePedidoMeseroScreen';

// ─── Stack para el flujo Inicio: Mesas → Catálogo (directo)
const InicioStack = createNativeStackNavigator();

function InicioStackNavigator() {
  return (
    <InicioStack.Navigator screenOptions={{ headerShown: false }}>
      <InicioStack.Screen name="Mesas" component={MesasScreen} />
      <InicioStack.Screen name="Catalogo" component={CatalogoScreen} />
    </InicioStack.Navigator>
  );
}

// ─── Stack para el flujo Pedidos: Lista → Detalle
const PedidosStack = createNativeStackNavigator();

function PedidosStackNavigator() {
  return (
    <PedidosStack.Navigator screenOptions={{ headerShown: false }}>
      <PedidosStack.Screen name="PedidosList" component={PedidosScreen} />
      <PedidosStack.Screen name="DetallePedidoMesero" component={DetallePedidoMeseroScreen} />
    </PedidosStack.Navigator>
  );
}

// ─── Bottom Tabs del Mesero ────────────────────────────────────
const Tab = createBottomTabNavigator();

export default function MeseroNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="InicioTab"
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
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';
          if (route.name === 'InicioTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'PedidosTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="InicioTab"
        component={InicioStackNavigator}
        options={{ tabBarLabel: 'Mesas' }}
      />
      <Tab.Screen
        name="PedidosTab"
        component={PedidosStackNavigator}
        options={{ tabBarLabel: 'Pedidos' }}
      />
    </Tab.Navigator>
  );
}
