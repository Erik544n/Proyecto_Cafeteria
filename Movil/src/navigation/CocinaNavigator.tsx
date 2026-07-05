import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ColaScreen from '../screens/cocina/ColaScreen';
import DetallePedidoScreen from '../screens/cocina/DetallePedidoScreen';
import IngredientesInsuficientesScreen from '../screens/cocina/IngredientesInsuficientesScreen';
import InventarioScreen from '../screens/cocina/InventarioScreen';
import MenuScreen from '../screens/cocina/MenuScreen';
import NotificacionesScreen from '../screens/cocina/NotificacionesScreen';

const Stack = createStackNavigator();

export default function CocinaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cola" component={ColaScreen} />
      <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <Stack.Screen name="IngredientesInsuficientes" component={IngredientesInsuficientesScreen} />
      <Stack.Screen name="Inventario" component={InventarioScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
  );
}
