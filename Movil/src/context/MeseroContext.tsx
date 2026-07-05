import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CATALOGO_MOCK, MESAS_MOCK, MesaDetalle, ProductoCatalogo } from '../data/mockData';

export interface PedidoMeseroItem {
  producto: ProductoCatalogo;
  cantidad: number;
}

export interface PedidoMesero {
  id: string;
  mesa: string;
  total: number;
  estado: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO';
  tiempo: string;
  items: PedidoMeseroItem[];
}

export interface NotificacionMesero {
  id: string;
  titulo: string;
  detalle: string;
  leida: boolean;
  tipo: 'LISTO' | 'INFO';
}

interface MeseroContextType {
  mesas: MesaDetalle[];
  mesaActiva: MesaDetalle | null;
  pedidos: PedidoMesero[];
  notificaciones: NotificacionMesero[];
  seleccionarMesa: (mesa: MesaDetalle) => void;
  crearPedido: (items: PedidoMeseroItem[]) => PedidoMesero | null;
  entregarPedido: (pedidoId: string) => void;
  marcarNotificacionLeida: (notificacionId: string) => void;
}

const MeseroContext = createContext<MeseroContextType | undefined>(undefined);

const initialPedidos: PedidoMesero[] = [
  {
    id: 'pedido-1',
    mesa: 'Mesa 04',
    total: 265,
    estado: 'EN_PREPARACION',
    tiempo: 'Hace 8 min',
    items: [
      { producto: CATALOGO_MOCK[0], cantidad: 2 },
      { producto: CATALOGO_MOCK[3], cantidad: 1 },
    ],
  },
];

const initialNotificaciones: NotificacionMesero[] = [
  {
    id: 'notif-1',
    titulo: 'Pedido en preparacion',
    detalle: 'Mesa 04 paso a cocina. Espera confirmacion de LISTO.',
    leida: false,
    tipo: 'INFO',
  },
];

export function MeseroProvider({ children }: { children: React.ReactNode }) {
  const [mesas] = useState<MesaDetalle[]>(MESAS_MOCK);
  const [mesaActiva, setMesaActiva] = useState<MesaDetalle | null>(null);
  const [pedidos, setPedidos] = useState<PedidoMesero[]>(initialPedidos);
  const [notificaciones, setNotificaciones] = useState<NotificacionMesero[]>(initialNotificaciones);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPedidos(prevPedidos => {
        const index = prevPedidos.findIndex(pedido => pedido.estado !== 'LISTO');

        if (index === -1) {
          return prevPedidos;
        }

        const pedidoActualizado = {
          ...prevPedidos[index],
          estado: 'LISTO' as const,
          tiempo: 'Hace 1 min',
        };

        const nextPedidos = [...prevPedidos];
        nextPedidos[index] = pedidoActualizado;

        setNotificaciones(prev => [
          {
            id: `notif-${Date.now()}`,
            titulo: 'Pedido LISTO',
            detalle: `${pedidoActualizado.mesa} ya puede ser entregado.`,
            leida: false,
            tipo: 'LISTO',
          },
          ...prev,
        ]);

        return nextPedidos;
      });
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  const seleccionarMesa = (mesa: MesaDetalle) => {
    setMesaActiva(mesa);
    if (mesa.estado === 'LIBRE') {
      setNotificaciones(prev => [
        {
          id: `notif-${Date.now()}`,
          titulo: `Mesa ${mesa.numero} seleccionada`,
          detalle: 'Puedes armar el pedido desde el catalogo.',
          leida: false,
          tipo: 'INFO',
        },
        ...prev,
      ]);
    }
  };

  const crearPedido = (items: PedidoMeseroItem[]) => {
    if (!mesaActiva || mesaActiva.estado !== 'LIBRE' || items.length === 0) {
      return null;
    }

    const total = items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
    const nuevoPedido: PedidoMesero = {
      id: `pedido-${Date.now()}`,
      mesa: `Mesa ${mesaActiva.numero}`,
      total,
      estado: 'PENDIENTE',
      tiempo: 'Hace unos segundos',
      items,
    };

    setPedidos(prev => [nuevoPedido, ...prev]);
    setNotificaciones(prev => [
      {
        id: `notif-${Date.now()}-pedido`,
        titulo: 'Pedido enviado',
        detalle: `${nuevoPedido.mesa} fue enviado a cocina.`,
        leida: false,
        tipo: 'INFO',
      },
      ...prev,
    ]);

    return nuevoPedido;
  };

  const entregarPedido = (pedidoId: string) => {
    setPedidos(prev =>
      prev.map(pedido =>
        pedido.id === pedidoId
          ? { ...pedido, estado: 'EN_PREPARACION', tiempo: 'Entregado a caja' }
          : pedido,
      ),
    );
    setNotificaciones(prev => [
      {
        id: `notif-${Date.now()}-entrega`,
        titulo: 'Pedido entregado',
        detalle: 'El pedido fue marcado como entregado.',
        leida: false,
        tipo: 'INFO',
      },
      ...prev,
    ]);
  };

  const marcarNotificacionLeida = (notificacionId: string) => {
    setNotificaciones(prev =>
      prev.map(notificacion =>
        notificacion.id === notificacionId ? { ...notificacion, leida: true } : notificacion,
      ),
    );
  };

  const value = useMemo(
    () => ({
      mesas,
      mesaActiva,
      pedidos,
      notificaciones,
      seleccionarMesa,
      crearPedido,
      entregarPedido,
      marcarNotificacionLeida,
    }),
    [mesaActiva, mesas, pedidos, notificaciones],
  );

  return <MeseroContext.Provider value={value}>{children}</MeseroContext.Provider>;
}

export function useMesero() {
  const context = useContext(MeseroContext);
  if (!context) {
    throw new Error('useMesero debe ser usado dentro de MeseroProvider');
  }
  return context;
}