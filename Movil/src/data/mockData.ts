// Datos de ejemplo (mock) para las interfaces de Cocina
// Sin conexión real a la API - solo para mostrar interfaces

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'URGENTE';

export interface ProductoDetalle {
  cantidad: number;
  nombre: string;
  observaciones?: string;
}

export interface Pedido {
  id: number;
  mesa: string | null;  // null = para llevar
  ticket: number;
  estado: EstadoPedido;
  tiempoEspera: string;
  productos: ProductoDetalle[];
  urgente?: boolean;
  barra?: boolean;
  tiempoInicio?: string;
}

export interface Insumo {
  nombre: string;
  disponible: string;
  necesario: string;
  estado: 'sin_stock' | 'stock_bajo';
}

export interface PedidoBloqueado {
  ticket: number;
  mesa: string;
  motivo: string;
  tiempo: string;
  productos: ProductoDetalle[];
  insumosFaltantes: Insumo[];
}

// ─── PEDIDOS MOCK ────────────────────────────────────────────────────────────
export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 1,
    ticket: 402,
    mesa: 'Mesa 04',
    estado: 'URGENTE',
    tiempoEspera: 'Hace 12 min',
    urgente: true,
    productos: [
      { cantidad: 2, nombre: 'Huevos Benedictinos' },
      { cantidad: 1, nombre: 'Sándwich de Salmón', observaciones: '"Sin cebolla en el sándwich, por favor."' },
    ],
  },
  {
    id: 2,
    ticket: 405,
    mesa: 'Mesa 12',
    estado: 'EN_PREPARACION',
    tiempoEspera: 'Hace 5 min',
    productos: [
      { cantidad: 1, nombre: 'Waffles con Frutas' },
      { cantidad: 1, nombre: 'Bowl de Açaí' },
    ],
  },
  {
    id: 3,
    ticket: 401,
    mesa: 'Barra',
    estado: 'EN_PREPARACION',
    tiempoEspera: '',
    barra: true,
    tiempoInicio: 'Iniciado: 10:42 AM',
    productos: [
      { cantidad: 3, nombre: 'Croissant de Mantequilla' },
      { cantidad: 2, nombre: 'Avocado Toast' },
    ],
  },
  {
    id: 4,
    ticket: 408,
    mesa: 'Mesa 01',
    estado: 'PENDIENTE',
    tiempoEspera: 'Hace 2 min',
    productos: [
      { cantidad: 1, nombre: 'Omelette de Champiñones' },
    ],
  },
  {
    id: 5,
    ticket: 395,
    mesa: null,
    estado: 'URGENTE',
    tiempoEspera: 'Hace 25 min',
    urgente: true,
    productos: [
      { cantidad: 4, nombre: 'Tostadas Francesas' },
    ],
  },
];

// ─── PEDIDO BLOQUEADO MOCK ────────────────────────────────────────────────────
export const PEDIDO_BLOQUEADO_MOCK: PedidoBloqueado = {
  ticket: 408,
  mesa: 'Mesa 01',
  motivo: 'Ingredientes Insuficientes',
  tiempo: 'Hace 2 min',
  productos: [
    { cantidad: 1, nombre: 'Omelette de Champiñones', observaciones: 'Nota: Con queso extra' },
  ],
  insumosFaltantes: [
    { nombre: 'Champiñones frescos', disponible: '0 unid.', necesario: '150g', estado: 'sin_stock' },
    { nombre: 'Queso Manchego', disponible: '20g', necesario: '30g', estado: 'stock_bajo' },
    { nombre: 'Crema para cocinar', disponible: '30ml', necesario: '80ml', estado: 'stock_bajo' },
  ],
};

// ─── INVENTARIO MOCK ─────────────────────────────────────────────────────────
export const INVENTARIO_MOCK = [
  { id: 1, nombre: 'Huevos', stock: 48, minimo: 12, unidad: 'pzas', estado: 'ok' },
  { id: 2, nombre: 'Champiñones frescos', stock: 0, minimo: 200, unidad: 'g', estado: 'sin_stock' },
  { id: 3, nombre: 'Queso Manchego', stock: 20, minimo: 100, unidad: 'g', estado: 'sin_stock' },
  { id: 4, nombre: 'Crema para cocinar', stock: 30, minimo: 200, unidad: 'ml', estado: 'stock_bajo' },
  { id: 5, nombre: 'Pan para sándwich', stock: 12, minimo: 8, unidad: 'pzas', estado: 'ok' },
  { id: 6, nombre: 'Aguacate', stock: 5, minimo: 10, unidad: 'pzas', estado: 'stock_bajo' },
  { id: 7, nombre: 'Salmón ahumado', stock: 250, minimo: 100, unidad: 'g', estado: 'ok' },
  { id: 8, nombre: 'Leche entera', stock: 2, minimo: 5, unidad: 'L', estado: 'stock_bajo' },
  { id: 9, nombre: 'Harina', stock: 2000, minimo: 500, unidad: 'g', estado: 'ok' },
  { id: 10, nombre: 'Mantequilla', stock: 400, minimo: 200, unidad: 'g', estado: 'ok' },
];

// ─── MENU MOCK ────────────────────────────────────────────────────────────────
export const MENU_MOCK = [
  { id: 1, nombre: 'Huevos Benedictinos', categoria: 'Brunch', precio: 185, disponible: true },
  { id: 2, nombre: 'Omelette de Champiñones', categoria: 'Brunch', precio: 145, disponible: false },
  { id: 3, nombre: 'Waffles con Frutas', categoria: 'Desayunos', precio: 120, disponible: true },
  { id: 4, nombre: 'Bowl de Açaí', categoria: 'Saludable', precio: 155, disponible: true },
  { id: 5, nombre: 'Avocado Toast', categoria: 'Brunch', precio: 130, disponible: true },
  { id: 6, nombre: 'Sándwich de Salmón', categoria: 'Sandwiches', precio: 175, disponible: true },
  { id: 7, nombre: 'Croissant de Mantequilla', categoria: 'Panadería', precio: 65, disponible: true },
  { id: 8, nombre: 'Tostadas Francesas', categoria: 'Desayunos', precio: 115, disponible: true },
];
