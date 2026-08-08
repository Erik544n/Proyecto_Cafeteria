import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

import CuentasActivasScreen from '../screens/caja/CuentasActivasScreen';
import DetallePedidoScreen from '../screens/caja/DetallePedidoScreen';
import ProcesarPagoScreen from '../screens/caja/ProcesarPagoScreen';
import TicketScreen from '../screens/caja/TicketScreen';
import HistorialVentasScreen from '../screens/caja/HistorialVentasScreen';

export type CajaStackParamList = {
  CuentasActivas: undefined;
  DetallePedido: { pedidoId: string };
  ProcesarPago: { pedidoId: string; total: number };
  Ticket: { ticketData: any };
};

export type HistorialStackParamList = {
  Historial: undefined;
  Ticket: { ticketData: any };
};

const CobrosStack = createNativeStackNavigator<CajaStackParamList>();
function CobrosStackNavigator() {
  return (
    <CobrosStack.Navigator screenOptions={{ headerShown: false }}>
      <CobrosStack.Screen name="CuentasActivas" component={CuentasActivasScreen} />
      <CobrosStack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <CobrosStack.Screen name="ProcesarPago" component={ProcesarPagoScreen} />
      <CobrosStack.Screen name="Ticket" component={TicketScreen} />
    </CobrosStack.Navigator>
  );
}

const HistorialStack = createNativeStackNavigator<HistorialStackParamList>();
function HistorialStackNavigator() {
  return (
    <HistorialStack.Navigator screenOptions={{ headerShown: false }}>
      <HistorialStack.Screen name="Historial" component={HistorialVentasScreen} />
      <HistorialStack.Screen name="Ticket" component={TicketScreen} />
    </HistorialStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function CajaNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'card';
          if (route.name === 'CobrosTab') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'HistorialTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e8ddd0',
        },
      })}
    >
      <Tab.Screen
        name="CobrosTab"
        component={CobrosStackNavigator}
        options={{ tabBarLabel: 'Cobros' }}
      />
      <Tab.Screen
        name="HistorialTab"
        component={HistorialStackNavigator}
        options={{ tabBarLabel: 'Ventas' }}
      />
    </Tab.Navigator>
  );
}
