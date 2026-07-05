import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MesasScreen from '../screens/mesero/MesasScreen';
import CatalogoScreen from '../screens/mesero/CatalogoScreen';
import PedidosScreen from '../screens/mesero/PedidosScreen';
import NotificacionesScreen from '../screens/mesero/NotificacionesScreen';
import { MeseroProvider } from '../context/MeseroContext';

const Stack = createStackNavigator();

export default function MeseroNavigator() {
  return (
    <MeseroProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Mesas">
        <Stack.Screen name="Mesas" component={MesasScreen} />
        <Stack.Screen name="Catalogo" component={CatalogoScreen} />
        <Stack.Screen name="Pedidos" component={PedidosScreen} />
        <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
      </Stack.Navigator>
    </MeseroProvider>
  );
}