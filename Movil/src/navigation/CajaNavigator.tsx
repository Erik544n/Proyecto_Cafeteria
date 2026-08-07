import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CuentasActivasScreen from '../screens/caja/CuentasActivasScreen';
import DetallePedidoScreen from '../screens/caja/DetallePedidoScreen';
import ProcesarPagoScreen from '../screens/caja/ProcesarPagoScreen';
import TicketScreen from '../screens/caja/TicketScreen';

export type CajaStackParamList = {
  CuentasActivas: undefined;
  DetallePedido: { pedidoId: string };
  ProcesarPago: { pedidoId: string; total: number };
  Ticket: { ticketData: any };
};

const Stack = createNativeStackNavigator<CajaStackParamList>();

export default function CajaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CuentasActivas" component={CuentasActivasScreen} />
      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <Stack.Screen name="ProcesarPago" component={ProcesarPagoScreen} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
    </Stack.Navigator>
  );
}
