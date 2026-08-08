import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import CocinaNavigator from './CocinaNavigator';
import CajaNavigator from './CajaNavigator';
import MeseroNavigator from './MeseroNavigator';


export default function AppNavigator() {
  const { role } = useAuth();

  if (role === null) {
    return <LoginScreen />;
  }

  if (role === 'MESERO') {
    return <MeseroNavigator />;
  }

  if (role === 'COCINA') {
    return <CocinaNavigator />;
  }

  if (role === 'CAJERO') {
    return <CajaNavigator />;
  }

  return <LoginScreen />;
}
