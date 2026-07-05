import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import CuentasActivasScreen from './screens/CuentasActivasScreen';
import DetallePedidoScreen from './screens/DetallePedidoScreen';
import ProcesarPagoScreen from './screens/ProcesarPagoScreen';
import TicketScreen from './screens/TicketScreen';
import { colors } from './constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const ROUTES = {
  LOGIN: 'LOGIN',
  CUENTAS: 'CUENTAS',
  DETALLE: 'DETALLE',
  PAGO: 'PAGO',
  TICKET: 'TICKET',
};

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [session, setSession] = useState(null);
  const [route, setRoute] = useState(ROUTES.LOGIN);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      setAppReady(true);
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  const navigation = useMemo(
    () => ({
      goToLogin: () => {
        setSession(null);
        setSelectedPedido(null);
        setTicket(null);
        setRoute(ROUTES.LOGIN);
      },
      goToCuentas: () => {
        setSelectedPedido(null);
        setTicket(null);
        setRoute(ROUTES.CUENTAS);
      },
      goToDetalle: (pedido) => {
        setSelectedPedido(pedido);
        setRoute(ROUTES.DETALLE);
      },
      goToPago: (pedido) => {
        setSelectedPedido(pedido);
        setRoute(ROUTES.PAGO);
      },
      goToTicket: (venta, pedido) => {
        setTicket({ venta, pedido });
        setRoute(ROUTES.TICKET);
      },
    }),
    []
  );

  const handleLogin = useCallback((nextSession) => {
    setSession(nextSession);
    setRoute(ROUTES.CUENTAS);
  }, []);

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      {route === ROUTES.LOGIN && <LoginScreen onLogin={handleLogin} />}
      {route === ROUTES.CUENTAS && (
        <CuentasActivasScreen session={session} navigation={navigation} />
      )}
      {route === ROUTES.DETALLE && (
        <DetallePedidoScreen
          session={session}
          pedido={selectedPedido}
          navigation={navigation}
        />
      )}
      {route === ROUTES.PAGO && (
        <ProcesarPagoScreen
          session={session}
          pedido={selectedPedido}
          navigation={navigation}
        />
      )}
      {route === ROUTES.TICKET && (
        <TicketScreen ticket={ticket} navigation={navigation} />
      )}
    </>
  );
}
