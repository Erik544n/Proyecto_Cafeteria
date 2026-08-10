// ─────────────────────────────────────────────────────────────
// CAPA DE SERVICIOS - Comunicación con la API REST
// Todos los endpoints que usa la app móvil pasan por aquí.
// ─────────────────────────────────────────────────────────────
import { API_CONFIG } from './config';

const BASE = API_CONFIG.BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────
function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('401: Credenciales incorrectas');
    }
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = data.detail || JSON.stringify(data);
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────
export async function apiLogin(email: string, password: string) {
  const res = await fetch(
    `${BASE}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      } 
    }
  );
  return handleResponse(res);
}

// ─── Mesero: Mesas ──────────────────────────────────────────────
export async function apiGetMesas(token: string) {
  const res = await fetch(`${BASE}/mesero/mesas`, {
    headers: authHeaders(token),
  });
  return handleResponse(res); // Array de mesas
}

// ─── Mesero: Productos (Catálogo) ──────────────────────────────
export async function apiGetProductos(token: string) {
  const res = await fetch(`${BASE}/mesero/productos`, {
    headers: authHeaders(token),
  });
  return handleResponse(res); // Array de productos
}

// ─── Mesero: Pedidos ──────────────────────────────────────────
export interface DetallePedidoInput {
  producto_id: number;
  cantidad: number;
  observaciones?: string;
}

export interface CrearPedidoInput {
  mesa_id: number;
  num_personas: number;
  observaciones?: string;
  detalles: DetallePedidoInput[];
}

export async function apiCrearPedido(token: string, body: CrearPedidoInput) {
  const res = await fetch(`${BASE}/mesero/pedidos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiGetPedidos(token: string) {
  const res = await fetch(`${BASE}/mesero/pedidos`, {
    headers: authHeaders(token),
  });
  return handleResponse(res); // Array de todos los pedidos
}

export async function apiGetPedido(token: string, pedidoId: number) {
  const res = await fetch(`${BASE}/mesero/pedidos/${pedidoId}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Mesero: Entregar pedido ───────────────────────────────────
export async function apiEntregarPedido(token: string, pedidoId: number) {
  const res = await fetch(`${BASE}/mesero/pedidos/${pedidoId}/entregar`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Mesero: Notificaciones ────────────────────────────────────
export async function apiMeseroGetNotificaciones(token: string) {
  const res = await fetch(`${BASE}/mesero/notificaciones`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ═══════════════════════════════════════════════════════════════
// COCINA
// ═══════════════════════════════════════════════════════════════

// ─── Cocina: Pedidos pendientes ─────────────────────────────────
export async function apiCocinaGetPedidos(token: string) {
  const res = await fetch(`${BASE}/cocina/pedidos`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Cocina: Actualizar estado de pedido ────────────────────────
export async function apiCocinaActualizarEstado(
  token: string,
  pedidoId: number,
  estado: string
) {
  const res = await fetch(`${BASE}/cocina/pedidos/${pedidoId}/estado`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ estado }),
  });
  return handleResponse(res);
}

// ─── Cocina: Iniciar preparación (shortcut) ────────────────────
export async function apiCocinaPreparar(token: string, pedidoId: number) {
  const res = await fetch(`${BASE}/cocina/pedidos/${pedidoId}/preparar`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Cocina: Marcar listo (shortcut) ───────────────────────────
export async function apiCocinaMarcarListo(token: string, pedidoId: number) {
  const res = await fetch(`${BASE}/cocina/pedidos/${pedidoId}/listo`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Cocina: Inventario ────────────────────────────────────────
export async function apiCocinaGetInventario(token: string) {
  const res = await fetch(`${BASE}/cocina/inventario`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function apiCocinaGetBajoStock(token: string) {
  const res = await fetch(`${BASE}/cocina/inventario/bajo-stock`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Cocina: Productos (menú) ──────────────────────────────────
export interface ProductoCreateInput {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
}

export async function apiCocinaCrearProducto(token: string, body: ProductoCreateInput) {
  const res = await fetch(`${BASE}/cocina/productos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiCocinaGetProducto(token: string, productoId: number) {
  const res = await fetch(`${BASE}/cocina/productos/${productoId}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function apiCocinaEditarProducto(
  token: string,
  productoId: number,
  body: ProductoCreateInput
) {
  const res = await fetch(`${BASE}/cocina/productos/${productoId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiCocinaEliminarProducto(token: string, productoId: number) {
  const res = await fetch(`${BASE}/cocina/productos/${productoId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Cocina: Insumos ───────────────────────────────────────────
export interface InsumoCreateInput {
  nombre: string;
  unidad_id: number;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
}

export interface InsumoUpdateInput {
  stock_actual?: number;
  stock_minimo?: number;
  costo_unitario?: number;
}

export async function apiCocinaCrearInsumo(token: string, body: InsumoCreateInput) {
  const res = await fetch(`${BASE}/cocina/insumos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiCocinaEditarInsumo(
  token: string,
  insumoId: number,
  body: InsumoUpdateInput
) {
  const res = await fetch(`${BASE}/cocina/insumos/${insumoId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiCocinaEliminarInsumo(token: string, insumoId: number) {
  const res = await fetch(`${BASE}/cocina/insumos/${insumoId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ═══════════════════════════════════════════════════════════════
// CAJA
// ═══════════════════════════════════════════════════════════════

// ─── Caja: Pedidos por cobrar ──────────────────────────────────
export async function apiCajaGetPedidos(token: string) {
  const res = await fetch(`${BASE}/caja/pedidos`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function apiCajaGetPedido(token: string, pedidoId: number) {
  const res = await fetch(`${BASE}/caja/pedidos/${pedidoId}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Caja: Procesar pago ───────────────────────────────────────
export interface VentaCreateInput {
  pedido_id: number;
  metodo_pago: string; // EFECTIVO | TARJETA | TRANSFERENCIA
  monto_pagado: number;
  descuento?: number;
}

export async function apiCajaProcesarPago(token: string, body: VentaCreateInput) {
  const res = await fetch(`${BASE}/caja/ventas`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// ─── Caja: Cancelar pedido ─────────────────────────────────────
export async function apiCajaCancelarPedido(token: string, pedidoId: number) {
  const res = await fetch(`${BASE}/caja/pedidos/${pedidoId}/cancelar`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Caja: Ventas del día ──────────────────────────────────────
export async function apiCajaVentasHoy(token: string) {
  const res = await fetch(`${BASE}/caja/ventas/hoy`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Caja: Ticket de venta ─────────────────────────────────────
export async function apiCajaGetTicket(token: string, ventaId: number) {
  const res = await fetch(`${BASE}/caja/ventas/${ventaId}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Caja: Anular venta ────────────────────────────────────────
export async function apiCajaAnularVenta(token: string, ventaId: number) {
  const res = await fetch(`${BASE}/caja/ventas/${ventaId}/anular`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ─── Caja: Gastos ──────────────────────────────────────────────
export async function apiCajaGetGastos(token: string) {
  const res = await fetch(`${BASE}/caja/gastos`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export interface GastoCreateInput {
  categoria_gasto_id: number;
  concepto: string;
  monto: number;
}

export async function apiCajaCrearGasto(token: string, body: GastoCreateInput) {
  const res = await fetch(`${BASE}/caja/gastos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiCajaGetGasto(token: string, gastoId: number) {
  const res = await fetch(`${BASE}/caja/gastos/${gastoId}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function apiCajaEliminarGasto(token: string, gastoId: number) {
  const res = await fetch(`${BASE}/caja/gastos/${gastoId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
